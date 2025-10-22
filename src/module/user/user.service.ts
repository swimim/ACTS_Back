import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { verify_code } from '../auth/entity/verifyCode.entity';
import { SignupDTO } from './dto/signup.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(user)
        private readonly userRepository: Repository<user>,
        @InjectRepository(verify_code)
        private readonly verifyCodeRepository: Repository<verify_code>
    ) {}

    async signup(dto: SignupDTO) {
        const existId = await this.userRepository.findOne({ where: { user_id: dto.user_id }});
        const existEmail = await this.userRepository.findOne({ where: { email: dto.email }});

        if (existId != null || existEmail != null) {
            throw new ConflictException('이미 존재하는 아이디 또는 이메일입니다.');
        }

        const isVerifiedEmail = await this.verifyCodeRepository.findOne({ where: { email: dto.email }});

        if (!isVerifiedEmail || !isVerifiedEmail.verified) {
            throw new BadRequestException('이메일을 인증해 주세요.');
        }

        if (dto.password != dto.confirmPassword) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            user_id: dto.user_id,
            password: hashedPassword,
            email: dto.email,
            gender: dto.gender,
            birth: dto.birth
        });

        await this.verifyCodeRepository.remove(isVerifiedEmail);
        await this.userRepository.save(user);
    }
}
