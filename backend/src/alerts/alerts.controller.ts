import { Controller, Get, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getAlerts(@Request() req: any, @Query('limit') limit?: number) {
    return this.alertsService.getAlertsForOrg(req.user.orgId, limit || 50);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.alertsService.updateAlertStatus(id, status, req.user.orgId);
  }
}
