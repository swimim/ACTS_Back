import { IsInt, IsNotEmpty, IsNumber, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { CatScoreDto } from "./cat-score.dto"

export class SaveReportDto {
  @IsNotEmpty()
  @IsInt()
  day_of_week: number

  @IsNotEmpty()
  @IsNumber()
  p_final: number

  @IsNotEmpty()
  @IsNumber()
  label_final: number

  @ValidateNested()
  @Type(() => CatScoreDto)
  @IsNotEmpty()
  cat_scores_100: CatScoreDto
}