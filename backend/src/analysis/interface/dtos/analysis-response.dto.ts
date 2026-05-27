import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Analysis } from '../../domain/analysis.entity.js';
import { AnalysisStatus } from '../../domain/analysis-status.enum.js';

export class AnalysisResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiProperty({ enum: AnalysisStatus, example: AnalysisStatus.COMPLETED })
  status!: AnalysisStatus;

  @ApiPropertyOptional({ example: 0.32 })
  foot_contact?: number;

  @ApiPropertyOptional({ example: 1.08 })
  foot_off?: number;

  @ApiPropertyOptional({ example: 1.22 })
  turning_point?: number;

  static fromEntity(analysis: Analysis): AnalysisResponseDto {
    const dto = new AnalysisResponseDto();
    dto.id = analysis.id;
    dto.status = analysis.status;
    if (analysis.result) {
      dto.foot_contact = analysis.result.foot_contact;
      dto.foot_off = analysis.result.foot_off;
      dto.turning_point = analysis.result.turning_point;
    }
    return dto;
  }
}
