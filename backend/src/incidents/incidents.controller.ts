import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async getIncidents(@Request() req: any, @Query('limit') limit?: number) {
    return this.incidentsService.getIncidentsForOrg(req.user.orgId, limit || 50);
  }

  @Post()
  async createIncident(@Body() body: any, @Request() req: any) {
    return this.incidentsService.createIncident(body, req.user.orgId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.incidentsService.updateIncidentStatus(id, status, req.user.orgId);
  }
}
