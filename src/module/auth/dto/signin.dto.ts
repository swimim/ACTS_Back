import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SigninDTO {
    @IsNotEmpty()
    @IsString()
    user_id: string

    @IsNotEmpty()
    @IsString()
    password: string
}