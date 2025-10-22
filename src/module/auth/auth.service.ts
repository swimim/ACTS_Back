import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user } from '../user/entity/user.entity';
import { SendVerifyCodeDTO } from './dto/sendVerifyCode.dto';
import { verify_code } from './entity/verifyCode.entity';
import { VerifyCodeDTO } from './dto/verifyCode.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SigninDTO } from './dto/signin.dto';
import { refreshToken } from './entity/refreshToken.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(user)
        private readonly userRepository: Repository<user>,
        @InjectRepository(verify_code)
        private readonly verifyCodeRepository: Repository<verify_code>,
        @InjectRepository(refreshToken)
        private readonly refreshTokenRepository: Repository<refreshToken>,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService
    ) {}

    async sendCode(dto: SendVerifyCodeDTO) {
        await this.verifyCodeRepository.delete({ email: dto.email });
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();

        const code = this.verifyCodeRepository.create({
            email: dto.email,
            code: newCode,
            createdAt: new Date()
        });

        await this.mailerService.sendMail({
            to: dto.email,
            subject: "[회원가입] 5분 내로 이메일 인증을 완료해 주세요.",
            text: `인증코드: ${newCode}`
        })

        await this.verifyCodeRepository.save(code);
    }

    async verifyCode(dto: VerifyCodeDTO) {
        const existCode = await this.verifyCodeRepository.findOne({ where: { email: dto.email }});

        if (existCode == null) {
            throw new BadRequestException("인증코드를 먼저 발송해주세요.");
        }

        if (existCode.verified) {
            throw new BadRequestException("이미 인증되었습니다.");
        }

        const expireTime = new Date();
        expireTime.setMinutes(existCode.createdAt.getMinutes() + 5);

        if (new Date() > expireTime) {
            throw new BadRequestException("인증 시간이 만료되었습니다.");
        }

        if (existCode.code != dto.code) {
            throw new BadRequestException("인증코드가 일치하지 않습니다.");
        }

        existCode.verified = true;
        await this.verifyCodeRepository.save(existCode);
    }

    async signin(dto: SigninDTO) {
        const user = await this.userRepository.findOne({ where: { user_id: dto.user_id } });

        if (user == null) {
            throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);

        if (!isMatch) {
            throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        const payload = { sub: user.idx };

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '14d'
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        await this.refreshTokenRepository.save({ refreshToken, expiresAt });

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(userId: number) {
        const accessToken = await this.jwtService.signAsync({ sub: userId });

        return { accessToken};
    }

    async logout(refreshToken: string) {
        await this.refreshTokenRepository.delete({ refreshToken });
    }
}