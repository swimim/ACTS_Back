import { GenderEnum } from "src/module/user/enum/gender.enum";
import { ProviderEnum } from "src/module/user/enum/provider.enum";

export class SocialSignupDto {
  username: string
  email: string
  gender: GenderEnum
  birth: Date
  provider: ProviderEnum
}