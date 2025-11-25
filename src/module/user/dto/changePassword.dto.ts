import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator"

export class ChangePasswordDTO {
  @IsNotEmpty()
  @IsString()
  currentPassword: string

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
      minLength: 7,
      minLowercase: 0,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1
  }, { message: '비밀번호는 7자 이상이어야 하며, 1개 이상의 숫자, 특수문자, 대문자를 포함해야 합니다.' })
  newPassword: string
}