import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DetectionService } from './detection.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/detection/rules')
@UseGuards(JwtAuthGuard)
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Get()
  async getRules(@Request() req: any) {
    return this.detectionService.getActiveRules(req.user.orgId);
  }

  @Post()
  async createRule(@Request() req: any, @Body() body: any) {
    return this.detectionService.createRule(req.user.orgId, body);
  }

  @Patch(':id/status')
  async updateRuleStatus(@Request() req: any, @Param('id') id: string, @Body() body: { enabled: boolean }) {
    return this.detectionService.updateRuleStatus(id, req.user.orgId, body.enabled);
  }
}
