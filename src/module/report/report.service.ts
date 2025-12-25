import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { report } from "./entity/report.entity";
import { Repository } from "typeorm";
import { catScore } from "./entity/cat-score.entity";
import { SaveReportDto } from "./dto/save-report.dto";

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(report)
    private readonly reportRepository: Repository<report>,
    @InjectRepository(catScore)
    private readonly catScoreRepository: Repository<catScore>
  ) {}
  
  public async saveReport(
    body: SaveReportDto,
    userIdx: number
  ) {
    const existReport = await this.reportRepository.findOne({
      where: {
        user: { idx: userIdx },
        day_of_week: body.day_of_week
      },
      relations: ['cat_score']
    });

    const savedCatScore = await this.catScoreRepository.save({
      ...(existReport?.cat_score && { idx: existReport.cat_score.idx }),
      ...body.cat_scores_100
    });

    await this.reportRepository.save({
      ...(existReport && { idx: existReport.idx }),
      day_of_week: body.day_of_week,
      p_final: body.p_final,
      label_final: body.label_final,
      cat_score: savedCatScore,
      user: { idx: userIdx },
      reported_at: new Date()
    });

    return await this.getReport(body.day_of_week, userIdx);
  }

  public async getReports(
    userIdx: number
  ) {
    const reports = await this.reportRepository.find({
      where: {
        user: { idx: userIdx }
      },
      relations: ['cat_score'],
      order: {
        day_of_week: 'ASC'
      }
    });

    const result = reports.filter(report =>
      report.day_of_week <= 6 && report.day_of_week >= 0
    );

    return result;
  }

  public async getReport(
    day_of_week: number,
    userIdx: number
  ) {
    const report = await this.reportRepository.findOne({
      where: {
        day_of_week,
        user: { idx: userIdx }
      },
      relations: ['cat_score']
    });

    if (!report) {
      throw new NotFoundException('검사 결과를 찾을 수 없습니다.');
    }

    const response = {
      ...report,
      score: Math.round(report.p_final * 100)
    }

    return response;
  }
}