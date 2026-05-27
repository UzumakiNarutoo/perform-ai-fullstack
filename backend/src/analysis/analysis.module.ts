import { Module } from '@nestjs/common';
import { ANALYSIS_REPOSITORY } from './application/ports/analysis.repository.port.js';
import { JOB_QUEUE } from './application/ports/job-queue.port.js';
import { CreateAnalysisUseCase } from './application/use-cases/create-analysis.use-case.js';
import { GetAnalysisUseCase } from './application/use-cases/get-analysis.use-case.js';
import { InMemoryAnalysisRepository } from './infrastructure/in-memory-analysis.repository.js';
import { InMemoryJobQueue } from './infrastructure/in-memory-job-queue.js';
import { MockBiomechanicsProcessor } from './infrastructure/mock-biomechanics-processor.js';
import { AnalysisController } from './interface/analysis.controller.js';

@Module({
  controllers: [AnalysisController],
  providers: [
    { provide: ANALYSIS_REPOSITORY, useClass: InMemoryAnalysisRepository },
    { provide: JOB_QUEUE, useClass: InMemoryJobQueue },
    MockBiomechanicsProcessor,
    CreateAnalysisUseCase,
    GetAnalysisUseCase,
  ],
})
export class AnalysisModule {}
