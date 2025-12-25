import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAccessGuard } from "../auth/guard/jwt-access.guard";
import { GetUser } from "src/common/decorators/getUser.decorator";
import { ReportService } from "./report.service";
import { SaveReportDto } from "./dto/save-report.dto";

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAccessGuard)
  @Post()
  public async saveReport(
    @Body() body: SaveReportDto,
    @GetUser() user
  ) {
    const userIdx = user.userIdx;
    const report = await this.reportService.saveReport(body, userIdx);

    return {
      message: '검사 결과 저장 성공',
      status: true,
      statusCode: 201,
      data: report
    };
  }

  @UseGuards(JwtAccessGuard)
  @Get()
  public async getReports(
    @GetUser() user
  ) {
    const userIdx = user.userIdx;
    const reports = await this.reportService.getReports(userIdx);

    return {
      message: '검사 결과 조회 성공',
      status: true,
      statusCode: 200,
      data: reports
    }
  }

  @UseGuards(JwtAccessGuard)
  @Get('/:day_of_week')
  public async getReport(
    @Param('day_of_week') day_of_week: number,
    @GetUser() user
  ) {
    const userIdx = user.userIdx;
    const report = await this.reportService.getReport(day_of_week, userIdx);

    return {
      message: '검사 결과 상세 조회 성공',
      status: true,
      statusCode: 200,
      data: report
    }
  }
}