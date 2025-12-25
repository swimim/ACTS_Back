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
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Post('/send-code')
    @HttpCode(201)
    async sendCode(@Body() dto: SendVerifyCodeDTO) {
        await this.authService.sendCode(dto);

        return {
            message: '인증 코드 발송 성공',
            status: true,
            statusCode: 201
        };
    }

    @Post('/verify-code')
    @HttpCode(200)
    async verifyCode(@Body() dto: VerifyCodeDTO) {
        await this.authService.verifyCode(dto);

        return {
            message: '이메일 인증 성공',
            status: true,
            statusCode: 200
        };
    }

    @Post('/signin')
    @HttpCode(200)
    async signin(
        @Body() dto: SigninDTO,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.signin(dto, res);

        return {
            message: '로그인 성공',
            status: true,
            statusCode: 200,
            data: result
        };
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/refresh')
    @HttpCode(201)
    async refreshAccessToken(@GetUser() user) {
        const userId = user.userId;
        const result = await this.authService.refreshAccessToken(userId);

        return {
            message: 'AccessToken 재발급 성공',
            status: true,
            statusCode: 201,
            data: result
        };
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/logout')
    @HttpCode(200)
    async logout(@GetUser() user) {
        const refreshToken = user.refreshToken;
        await this.authService.logout(refreshToken);

        return {
            message: '로그아웃 성공',
            status: true,
            statusCode: 200,
            data: null
        };
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

        return res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/auth/success?accesstoken=${result.accessToken}&refreshtoken=${result.refreshToken}&username=${result.username}`);
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

        return res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/auth/success?accesstoken=${result.accessToken}&refreshtoken=${result.refreshToken}&username=${result.username}`);
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

        return res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/auth/success?accesstoken=${result.accessToken}&refreshtoken=${result.refreshToken}&username=${result.username}`);
    }
}