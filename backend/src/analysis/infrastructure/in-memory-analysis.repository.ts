import { Injectable } from '@nestjs/common';
import { Analysis } from '../domain/analysis.entity.js';
import { AnalysisRepositoryPort } from '../application/ports/analysis.repository.port.js';

@Injectable()
export class InMemoryAnalysisRepository implements AnalysisRepositoryPort {
  private readonly store = new Map<string, Analysis>();

  save(analysis: Analysis): Promise<void> {
    this.store.set(analysis.id, analysis);
    return Promise.resolve();
  }

  findById(id: string): Promise<Analysis | undefined> {
    return Promise.resolve(this.store.get(id));
  }
}
