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
import { ProviderEnum } from '../user/enum/provider.enum';
import { GenderEnum } from '../user/enum/gender.enum';
import { SocialSignupDto } from './dto/socialSignup.dto';

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
    ) { }

    async validateToken(refreshToken: string) {
        const existingToken = await this.refreshTokenRepository.findOneBy({ refreshToken });

        if (!existingToken) throw new UnauthorizedException('토큰을 찾을 수 없습니다.');

        if (Date.now() > existingToken.expiresAt.getTime()) {
            await this.refreshTokenRepository.delete(existingToken);
            throw new UnauthorizedException('토큰이 만료되었습니다.');
        }
    }

    async sendCode(dto: SendVerifyCodeDTO) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

        const verifyCode = this.verifyCodeRepository.create({ email: dto.email, code, expiresAt });

        await this.mailerService.sendMail({
            to: dto.email,
            subject: "[회원가입] 5분 내로 이메일 인증을 완료해 주세요.",
            text: `인증코드: ${code}`
        })

        await this.verifyCodeRepository.upsert(verifyCode, ['email']);
    }

    async verifyCode(dto: VerifyCodeDTO) {
        const existingCode = await this.verifyCodeRepository.findOne({ where: { email: dto.email } });

        if (!existingCode) throw new BadRequestException("인증코드를 먼저 발송해주세요.");
        if (existingCode.isVerified) throw new BadRequestException("이미 인증되었습니다.");

        if (Date.now() > existingCode.expiresAt.getTime()) {
            throw new BadRequestException("인증 시간이 만료되었습니다.");
        }

        if (existingCode.code != dto.code) {
            throw new BadRequestException("인증코드가 일치하지 않습니다.");
        }

        await this.verifyCodeRepository.update(existingCode, {
            isVerified: true
        });
    }

    async signin(dto: SigninDTO) {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
            select: ['idx', 'password', 'username']
        });
        if (!user) throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");

        const isMatch = await bcrypt.compare(dto.password, user.password!);
        if (!isMatch) throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");

        const payload = { sub: user.idx };
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '14d'
        });
        const username = user.username;

        await this.refreshTokenRepository.save({ refreshToken, expiresAt });

        return { accessToken, refreshToken, username };
    }

    async refreshAccessToken(userId: number) {
        return await this.jwtService.signAsync({ sub: userId });
    }

    async logout(refreshToken: string) {
        await this.refreshTokenRepository.delete({ refreshToken });
    }

    async OAuthSignIn(clientId: string, profileNickname: string, provider: ProviderEnum, gender?: GenderEnum, birth?: Date) {
        if (await this.userRepository.existsBy({ email: clientId })) {
            const user = await this.userRepository.findOne({
                where: { email: clientId },
                select: ['idx', 'password', 'username']
            });
            if (!user) throw new BadRequestException("존재하지 않는 계정입니다.");

            const payload = { sub: user.idx };
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

            const accessToken = await this.jwtService.signAsync(payload);
            const refreshToken = await this.jwtService.signAsync(payload, {
                expiresIn: '14d'
            });
            const username = user.username;

            await this.refreshTokenRepository.save({ refreshToken, expiresAt });

            return { accessToken, refreshToken, username };
        } else {
            // 존재하지 않는 경우
            console.log()
            const user = await this.userRepository.create({
                birth: birth ?? new Date('2000-01-01T00:00:00Z'),
                email: clientId,
                gender: gender ?? GenderEnum.male,
                provider: provider,
                username: profileNickname
            })

            await this.userRepository.save(user);

            const payload = { sub: user.idx };
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

            const accessToken = await this.jwtService.signAsync(payload);
            const refreshToken = await this.jwtService.signAsync(payload, {
                expiresIn: '14d'
            });

            await this.refreshTokenRepository.save({ refreshToken, expiresAt });

            return { accessToken, refreshToken, username: user.username };
        }
    }

    async validateUser(email: string) {
        const user = await this.userRepository.findOne({ where: { email }});

        return user;
    }

    async socialSignup(dto: SocialSignupDto) {
        await this.userRepository.save({
            username: dto.username,
            password: null,
            email: dto.email,
            gender: dto.gender,
            birth: dto.birth
        });
    }
}