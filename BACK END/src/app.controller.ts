import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Vérifier le statut de l\'application' })
  @ApiResponse({ status: 200, description: 'Application opérationnelle' })
  getStatus(): { message: string; timestamp: string; version: string } {
    return this.appService.getStatus();
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérifier la santé de l\'application' })
  @ApiResponse({ status: 200, description: 'Application en bonne santé' })
  getHealth(): { status: string; database: string; timestamp: string } {
    return this.appService.getHealth();
  }
}
