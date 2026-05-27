import { Module } from '@nestjs/common';
import { AnalysisModule } from './analysis/analysis.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [AnalysisModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
