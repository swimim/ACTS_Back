import {Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dto/signup.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('signup')
    signup(@Body() dto: SignupDTO) {
        return this.userService.signup(dto);
    }
}
