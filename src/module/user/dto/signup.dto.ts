import { IsDate, IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from "class-validator"
import { gender } from "../enum/gender.enum"
import { Timestamp } from "typeorm"
import { Type } from "class-transformer"

export class SignupDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(10, { message: '아이디는 10자 이하여야 합니다.' })
    username: string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 7,
        minLowercase: 0,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    }, { message: '비밀번호는 7자 이상이어야 하며, 1개 이상의 숫자, 특수문자, 대문자를 포함해야 합니다.' })
    password: string

    confirmPassword: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    gender: gender

    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    birth: Timestamp
}