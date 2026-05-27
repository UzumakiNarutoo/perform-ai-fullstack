import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiResponse({ status: 200, description: 'Service is up' })
  check(): { status: string; uptime: number } {
    return { status: 'ok', uptime: process.uptime() };
  }
}
