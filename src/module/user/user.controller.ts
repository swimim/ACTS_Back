import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dto/signup.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { ChangePasswordDTO } from './dto/changePassword.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('signup')
    @HttpCode(201)
    async signup(@Body() dto: SignupDTO) {
        await this.userService.signup(dto);

        return {
            message: '회원가입 성공',
            status: true,
            statusCode: 201
        };
    }

    @Get('my')
    @UseGuards(JwtAccessGuard)
    @HttpCode(200)
    async getUserInfo(@GetUser() user) {
        const userIdx = user.userIdx;
        const result = await this.userService.getUserInfo(userIdx);

        return {
            message: '사용자 정보 조회 성공',
            status: true,
            statusCode: 200,
            data: result
        };
    }

    @Patch('/password')
    @UseGuards(JwtAccessGuard)
    @HttpCode(200)
    async changePassword(
        @GetUser() user,
        @Body() dto: ChangePasswordDTO
    ) {
        const userIdx = user.userIdx;
        await this.userService.changePassword(userIdx, dto);
        
        return {
            message: '비밀번호 변경 성공',
            statuc: true,
            statusCode: 200
        }
    }
}
