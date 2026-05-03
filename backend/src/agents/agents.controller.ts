import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async getAgents(@Request() req: any) {
    return this.agentsService.getAgentsForOrg(req.user.orgId);
  }

  @Post('register')
  async registerAgent(@Body() body: any, @Request() req: any) {
    return this.agentsService.registerAgent(body, req.user.orgId);
  }

  @Post(':id/heartbeat')
  async heartbeat(@Param('id') id: string, @Request() req: any) {
    return this.agentsService.updateHeartbeat(id, req.user.orgId);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string, @Request() req: any) {
    return this.agentsService.deleteAgent(id, req.user.orgId);
  }
}
