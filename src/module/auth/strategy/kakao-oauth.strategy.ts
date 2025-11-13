import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      const { _json } = profile;
      const user = {
        kakaoId: _json.id,
        profileNickname: _json.properties?.nickname, 
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}