import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { CloudIntegrationsService } from './cloud-integrations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard)
export class CloudIntegrationsController {
  constructor(private readonly integrationsService: CloudIntegrationsService) {}

  @Get('status')
  async getStatus(@Request() req: any) {
    return this.integrationsService.getIntegrationStatus(req.user.orgId);
  }

  @Post('aws')
  async setupAwsIntegration(@Body() body: any, @Request() req: any) {
    // Body expects: accessKeyId, secretAccessKey, region
    return this.integrationsService.addAwsIntegration(req.user.orgId, body);
  }

  @Post('aws/sync')
  async syncAws(@Request() req: any) {
    const count = await this.integrationsService.syncAwsLogs(req.user.orgId);
    return { success: true, events_synced: count };
  }
}
