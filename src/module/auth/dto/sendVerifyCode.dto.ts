import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SendVerifyCodeDTO {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
}