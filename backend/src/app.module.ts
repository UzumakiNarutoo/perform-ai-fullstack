import { Module } from '@nestjs/common';
import { AnalysisModule } from './analysis/analysis.module.js';

@Module({
  imports: [AnalysisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
