import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      passReqToCallback: true,
      scope: [
        'profile',
        'email',
      ],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      console.log(profile)
      const { name, emails, _json } = profile;

      const user = {
        email: emails?.[0]?.value,
        username: name?.familyName ?? '' + name?.givenName,
        birthday: _json.birthday,
        gender: _json.gender,
      };

      done(null, user);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      done(err, false);
    }
  }
}