import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendVerifyCodeDTO } from './dto/sendVerifyCode.dto';
import { VerifyCodeDTO } from './dto/verifyCode.dto';
import { SigninDTO } from './dto/signin.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ProviderEnum } from '../user/enum/provider.enum';
import { naver } from './guard/naver-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

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

    @Get('/oauth/kakao')
    @UseGuards(AuthGuard('kakao'))
    @HttpCode(301)
    async kakaoLogin() { }

    @Get('/oauth/kakao/callback')
    @UseGuards(AuthGuard('kakao'))
    async kakaoCallback(@Req() req: any, @Res() res: any) {
        const result = await this.authService.OAuthSignIn(
            req.user.kakaoId,
            req.user.profileNickname,
            ProviderEnum.KAKAO
        );

        return res.redirect(`${this.configService.get('FRONTEND_URL') ?? 'localhost:5173'}/auth/success?accesstoken=${result.accessToken}&refreshtoken=${result.refreshToken}&username=${result.username}`);
    }

    @Get('/oauth/google')
    @UseGuards(AuthGuard('google'))
    @HttpCode(301)
    async googleLogin() { }

    @Get('/oauth/google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: any, @Res() res: any) {
        const result = await this.authService.OAuthSignIn(
            req.user.email,
            req.user.username,
            ProviderEnum.GOOGLE,
            req.user.gender,
            req.user.birth
        )

        return res.redirect(`${this.configService.get('FRONTEND_URL') ?? 'localhost:5173'}/auth/success?accesstoken=${result.accessToken}&refreshtoken=${result.refreshToken}&username=${result.username}`);
    }

    @Get('/oauth/naver')
    @UseGuards(naver)
    async naverLogin() { }

    @Get('/oauth/naver/callback')
    @UseGuards(naver)
    async naverCallback(@Req() req: any, @Res() res: any) {
        const result = await this.authService.OAuthSignIn(
            req.user.email,
            req.user.username,
            ProviderEnum.NAVER,
            req.user.gender,
            req.user.birth
        )

        return res.redirect(`${this.configService.get('FRONTEND_URL') ?? 'localhost:5173'}/auth/success?accesstoken=${result.accessToken}&refreshtoken=${result.refreshToken}&username=${result.username}`);
    }
}