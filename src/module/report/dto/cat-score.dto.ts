import { IsInt, IsNotEmpty } from "class-validator"

export class CatScoreDto {
  @IsNotEmpty()
  @IsInt()
  simple: number

  @IsNotEmpty()
  @IsInt()
  sustained: number

  @IsNotEmpty()
  @IsInt()
  interference: number

  @IsNotEmpty()
  @IsInt()
  divided: number

  @IsNotEmpty()
  @IsInt()
  working_memory: number
}