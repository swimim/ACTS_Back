import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStretagy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const secret = configService.get<string>('TOKEN_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('TOKEN_SECRET is undefined.');
    }

    super({
      jwtFromRequest: (req: Request) => {
        const refreshToken = req?.cookies?.['refreshToken'];
        return refreshToken;
      },
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }
  
  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('토큰을 찾을 수 없습니다.');
    }

    await this.authService.validateToken(refreshToken);

    return { userId: payload.sub, refreshToken };
  }
}