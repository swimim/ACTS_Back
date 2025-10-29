import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStretagy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService
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
  
  validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('토큰을 찾을 수 없습니다.');
    }

    return { userId: payload.sub, refreshToken };
  }
}