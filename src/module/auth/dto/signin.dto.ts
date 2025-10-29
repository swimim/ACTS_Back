import { IsNotEmpty, IsString } from "class-validator";

export class SigninDTO {
    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsString()
    password: string
}