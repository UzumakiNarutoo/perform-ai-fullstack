import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAnalysisUseCase } from '../application/use-cases/create-analysis.use-case.js';
import { GetAnalysisUseCase } from '../application/use-cases/get-analysis.use-case.js';
import { AnalysisResponseDto } from './dtos/analysis-response.dto.js';
import { CreateAnalysisDto } from './dtos/create-analysis.dto.js';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly createAnalysis: CreateAnalysisUseCase,
    private readonly getAnalysis: GetAnalysisUseCase,
  ) {}

  @Post()
  @HttpCode(202)
  @ApiResponse({ status: 202, description: 'Analysis queued', type: AnalysisResponseDto })
  async create(@Body() dto: CreateAnalysisDto): Promise<AnalysisResponseDto> {
    const analysis = await this.createAnalysis.execute(dto.athlete);
    return AnalysisResponseDto.fromEntity(analysis);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Analysis result', type: AnalysisResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getById(@Param('id') id: string): Promise<AnalysisResponseDto> {
    const analysis = await this.getAnalysis.execute(id);
    return AnalysisResponseDto.fromEntity(analysis);
  }
}
