import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendVerifyCodeDTO } from './dto/sendVerifyCode.dto';
import { VerifyCodeDTO } from './dto/verifyCode.dto';
import { SigninDTO } from './dto/signin.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('code/send')
    sendCode(@Body() dto: SendVerifyCodeDTO) {
        return this.authService.sendCode(dto);
    }

    @Post('code/verify')
    verifyCode(@Body() dto: VerifyCodeDTO) {
        return this.authService.verifyCode(dto);
    }

    @Post('signin')
    signin(@Body() dto: SigninDTO) {
        return this.authService.signin(dto);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    refreshAccessToken(@Req() req: any) {
        const userId = req.user.userId;
        return this.authService.refreshAccessToken(userId);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('logout')
    logout(@Req() req: any) {
        const refreshToken = req.user.refreshToken;
        return this.authService.logout(refreshToken);
    }
}
