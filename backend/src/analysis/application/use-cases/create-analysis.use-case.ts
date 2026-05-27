import { Inject, Injectable } from '@nestjs/common';
import { Analysis } from '../../domain/analysis.entity.js';
import { ANALYSIS_REPOSITORY } from '../ports/analysis.repository.port.js';
import type { AnalysisRepositoryPort } from '../ports/analysis.repository.port.js';
import { JOB_QUEUE } from '../ports/job-queue.port.js';
import type { JobQueuePort } from '../ports/job-queue.port.js';

@Injectable()
export class CreateAnalysisUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly repository: AnalysisRepositoryPort,
    @Inject(JOB_QUEUE)
    private readonly queue: JobQueuePort,
  ) {}

  async execute(athlete: string): Promise<Analysis> {
    const analysis = new Analysis(crypto.randomUUID(), athlete);
    await this.repository.save(analysis);
    await this.queue.enqueue(analysis.id);
    return analysis;
  }
}
