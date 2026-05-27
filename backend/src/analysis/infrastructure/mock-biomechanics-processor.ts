import { Injectable } from '@nestjs/common';
import { AnalysisResult } from '../domain/analysis-result.interface.js';

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

@Injectable()
export class MockBiomechanicsProcessor {
  process(athlete: string): AnalysisResult {
    if (athlete.trim() === 'Demo Athlete') {
      return { foot_contact: 0.32, foot_off: 1.08, turning_point: 1.22 };
    }

    return {
      foot_contact: rand(0.25, 0.4),
      foot_off: rand(0.95, 1.2),
      turning_point: rand(1.1, 1.35),
    };
  }
}
