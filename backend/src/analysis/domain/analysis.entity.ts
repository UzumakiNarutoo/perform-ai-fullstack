import { AnalysisResult } from './analysis-result.interface.js';
import { AnalysisStatus } from './analysis-status.enum.js';

export class Analysis {
  id: string;
  athlete: string;
  status: AnalysisStatus;
  result?: AnalysisResult;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, athlete: string) {
    this.id = id;
    this.athlete = athlete;
    this.status = AnalysisStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  setProcessing(): void {
    this.status = AnalysisStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  complete(result: AnalysisResult): void {
    this.status = AnalysisStatus.COMPLETED;
    this.result = result;
    this.updatedAt = new Date();
  }

  fail(): void {
    this.status = AnalysisStatus.FAILED;
    this.updatedAt = new Date();
  }
}
