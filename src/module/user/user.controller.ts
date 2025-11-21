import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dto/signup.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('signup')
    signup(@Body() dto: SignupDTO) {
        return this.userService.signup(dto);
    }

    @Get('my')
    @UseGuards(JwtAccessGuard)
    getUserInfo(@GetUser() user) {
        const userIdx = user.userIdx;
        return this.userService.getUserInfo(userIdx);
    }
}
