import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnalysisDto {
  @ApiProperty({ example: 'Demo Athlete' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  athlete!: string;
}
