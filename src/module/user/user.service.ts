import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { verify_code } from '../auth/entity/verifyCode.entity';
import { SignupDTO } from './dto/signup.dto';
import { ChangePasswordDTO } from './dto/changePassword.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(user)
        private readonly userRepository: Repository<user>,
        @InjectRepository(verify_code)
        private readonly verifyCodeRepository: Repository<verify_code>
    ) {}

    // 회원가입
    async signup(dto: SignupDTO) {
        const existId = await this.userRepository.findOne({ where: { username: dto.username }});
        const existEmail = await this.userRepository.findOne({ where: { email: dto.email }});

        if (existId || existEmail) {
            throw new ConflictException({
                message: '이미 존재하는 아이디입니다.',
                status: false,
                statusCode: 101
            });
        }

        const isVerifiedEmail = await this.verifyCodeRepository.findOne({ where: { email: dto.email }});

        if (!isVerifiedEmail || !isVerifiedEmail.isVerified) {
            throw new BadRequestException({
                message: '이메일을 인증해 주세요.',
                status: false,
                statusCode: 102
            });
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            username: dto.username,
            password: hashedPassword,
            email: dto.email,
            gender: dto.gender,
            birth: dto.birth
        });

        await this.verifyCodeRepository.remove(isVerifiedEmail);
        await this.userRepository.save(user);
    }

    // 사용자 정보 조회
    async getUserInfo(userIdx: number) {
        const user = await this.userRepository.findOne({ where: { idx: userIdx }});

        if (!user) throw new NotFoundException({
            message: '사용자를 찾을 수 없습니다.',
            status: false,
            statusCode: 100
        });

        const birth = user.birth;
        const now = new Date();

        const hasPassed = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());

        const age = (now.getFullYear() - birth.getFullYear()) + (hasPassed ? -1 : 0);

        const userInfo = {
            username: user.username,
            email: user.email,
            gender: user.gender,
            birth,
            age
        };

        return userInfo;
    }

    // 비밀번호 변경
    async changePassword(userIdx: number, dto: ChangePasswordDTO) {
        const user = await this.userRepository.findOne({
            where: { idx: userIdx },
            select: ['password']
        });

        if (!user) {
            throw new NotFoundException({
                message: '사용자를 찾을 수 없습니다.',
                status: false,
                statusCode: 100
            });
        }

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password!);

        if (!isMatch) {
            throw new UnauthorizedException({
                message: '비밀번호가 일치하지 않습니다.',
                status: false,
                statusCode: 101
            });
        }

        const hashedPassword = bcrypt.hashSync(dto.newPassword, 10);

        await this.userRepository.update({ idx: userIdx }, { password: hashedPassword });
    }
}
