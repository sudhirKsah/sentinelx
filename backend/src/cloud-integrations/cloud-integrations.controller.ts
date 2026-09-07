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

  // ─────────── AWS ───────────
  @Post('aws')
  async setupAwsIntegration(@Body() body: any, @Request() req: any) {
    // Body expects: accessKeyId, secretAccessKey, region
    return this.integrationsService.addAwsIntegration(req.user.orgId, body);
  }

  @Post('aws/sync')
  async syncAws(@Request() req: any) {
    const count = await this.integrationsService.syncAwsLogs(req.user.orgId);
    return { success: true, provider: 'aws', events_synced: count };
  }

  // ─────────── GCP ───────────
  @Post('gcp')
  async setupGcpIntegration(@Body() body: { serviceAccountKey: string; projectId: string }, @Request() req: any) {
    // Body expects: serviceAccountKey (raw JSON string of the service account key file), projectId
    return this.integrationsService.addGcpIntegration(req.user.orgId, body);
  }

  @Post('gcp/sync')
  async syncGcp(@Request() req: any) {
    const count = await this.integrationsService.syncGcpLogs(req.user.orgId);
    return { success: true, provider: 'gcp', events_synced: count };
  }
}
