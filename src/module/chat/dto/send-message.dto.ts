import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SendMessageDto {
  @IsOptional()
  @IsNumber()
  chatIdx?: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  title?: string;
}
