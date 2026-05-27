import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Analysis } from '../../domain/analysis.entity.js';
import { ANALYSIS_REPOSITORY } from '../ports/analysis.repository.port.js';
import type { AnalysisRepositoryPort } from '../ports/analysis.repository.port.js';

@Injectable()
export class GetAnalysisUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly repository: AnalysisRepositoryPort,
  ) {}

  async execute(id: string): Promise<Analysis> {
    const analysis = await this.repository.findById(id);
    if (!analysis) {
      throw new NotFoundException(`Analysis ${id} not found`);
    }
    return analysis;
  }
}
