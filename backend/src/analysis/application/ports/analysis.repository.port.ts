import { Analysis } from '../../domain/analysis.entity.js';

export const ANALYSIS_REPOSITORY = Symbol('ANALYSIS_REPOSITORY');

export interface AnalysisRepositoryPort {
  save(analysis: Analysis): Promise<void>;
  findById(id: string): Promise<Analysis | undefined>;
}
