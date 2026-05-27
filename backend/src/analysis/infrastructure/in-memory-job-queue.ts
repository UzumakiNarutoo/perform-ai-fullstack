import { Inject, Injectable } from '@nestjs/common';
import { ANALYSIS_REPOSITORY } from '../application/ports/analysis.repository.port.js';
import type { AnalysisRepositoryPort } from '../application/ports/analysis.repository.port.js';
import type { JobQueuePort } from '../application/ports/job-queue.port.js';
import { MockBiomechanicsProcessor } from './mock-biomechanics-processor.js';

@Injectable()
export class InMemoryJobQueue implements JobQueuePort {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly repository: AnalysisRepositoryPort,
    private readonly processor: MockBiomechanicsProcessor,
  ) {}

  async enqueue(analysisId: string): Promise<void> {
    const delay = Math.floor(Math.random() * 700) + 800; // 800–1500ms
    setTimeout(() => void this.run(analysisId), delay);
  }

  private async run(analysisId: string): Promise<void> {
    const analysis = await this.repository.findById(analysisId);
    if (!analysis) return;

    try {
      analysis.setProcessing();
      await this.repository.save(analysis);

      const result = this.processor.process(analysis.athlete);

      analysis.complete(result);
      await this.repository.save(analysis);
    } catch {
      analysis.fail();
      await this.repository.save(analysis);
    }
  }
}
