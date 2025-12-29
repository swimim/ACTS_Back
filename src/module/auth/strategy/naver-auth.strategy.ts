import { BadRequestException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { Profile, Strategy } from "passport-naver-v2";
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";
import { GenderEnum } from "src/module/user/enum/gender.enum";
import { ProviderEnum } from "src/module/user/enum/provider.enum";
import { NaverPayload } from "../interfaces/naver-auth.interface";

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.getOrThrow<string>("NAVER_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("NAVER_CLIENT_PW"),
      callbackURL: configService.getOrThrow<string>("NAVER_CALLBACK"),
      passReqToCallback: true
    })
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile, done: Function) {
    const { provider, id, gender, name, birthday, birthYear } = profile;

    if (!gender || !name || !birthday || !birthYear) {
      throw new BadRequestException('필수 정보가 누락되었습니다.');
    }

    const parsedGender: GenderEnum = gender === 'M' ? GenderEnum.male : GenderEnum.female;
    const birth = new Date(`${birthYear}-${birthday}`);
    
    await this.authService.socialSignup({
      username: name,
      email: id,
      gender: parsedGender,
      birth,
      provider: ProviderEnum.NAVER
    });

    const user: NaverPayload = { nid: id, name };

    done(null, user)

    return user;
  }
}