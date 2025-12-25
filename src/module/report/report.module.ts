import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { report } from './entity/report.entity';
import { catScore } from './entity/cat-score.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      report, catScore
    ])
  ],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {}
