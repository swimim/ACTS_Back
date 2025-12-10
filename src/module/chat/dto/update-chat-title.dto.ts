import { IsString, Length } from "class-validator";

export class UpdateChatTitleDto {
  @IsString()
  @Length(1, 255)
  title: string
}