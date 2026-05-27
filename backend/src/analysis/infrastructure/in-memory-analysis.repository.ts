import { Injectable } from '@nestjs/common';
import { Analysis } from '../domain/analysis.entity.js';
import { AnalysisRepositoryPort } from '../application/ports/analysis.repository.port.js';

@Injectable()
export class InMemoryAnalysisRepository implements AnalysisRepositoryPort {
  private readonly store = new Map<string, Analysis>();

  async save(analysis: Analysis): Promise<void> {
    this.store.set(analysis.id, analysis);
  }

  async findById(id: string): Promise<Analysis | undefined> {
    return this.store.get(id);
  }
}
