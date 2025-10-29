import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendVerifyCodeDTO } from './dto/sendVerifyCode.dto';
import { VerifyCodeDTO } from './dto/verifyCode.dto';
import { SigninDTO } from './dto/signin.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/send-code')
    sendCode(@Body() dto: SendVerifyCodeDTO) {
        return this.authService.sendCode(dto);
    }

    @Post('/verify-code')
    verifyCode(@Body() dto: VerifyCodeDTO) {
        return this.authService.verifyCode(dto);
    }

    @Post('/signin')
    signin(@Body() dto: SigninDTO) {
        return this.authService.signin(dto);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/refresh')
    async refreshAccessToken(@GetUser() user) {
        const userId = user.userId;
        const accessToken = await this.authService.refreshAccessToken(userId);
        return { accessToken };
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/logout')
    logout(@GetUser() user) {
        const refreshToken = user.refreshToken;
        return this.authService.logout(refreshToken);
    }
}
