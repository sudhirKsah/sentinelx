import { Injectable, Logger } from '@nestjs/common';
import { AwsProvider } from './providers/aws.provider';

@Injectable()
export class CloudIntegrationsService {
  private readonly logger = new Logger(CloudIntegrationsService.name);
  
  // In a real DB, we would store integration credentials per org. 
  // For MVP, we'll keep them in memory to demonstrate the flow.
  private readonly activeIntegrations: Map<string, any> = new Map();

  constructor(private readonly awsProvider: AwsProvider) {}

  async addAwsIntegration(orgId: string, credentials: any) {
    this.logger.log(`Adding AWS integration for org ${orgId}`);
    
    // Save to "DB"
    this.activeIntegrations.set(orgId, { provider: 'aws', ...credentials });

    // Do an initial fetch
    const eventsFetched = await this.awsProvider.fetchCloudTrailLogs(credentials, orgId, 60); // fetch last 1 hour
    
    return { success: true, eventsFetched };
  }

  async syncAwsLogs(orgId: string) {
    const integration = this.activeIntegrations.get(orgId);
    if (!integration || integration.provider !== 'aws') {
      throw new Error('AWS integration not found for this org');
    }

    return this.awsProvider.fetchCloudTrailLogs(integration, orgId, 15);
  }

  getIntegrationStatus(orgId: string) {
    const integration = this.activeIntegrations.get(orgId);
    if (!integration) {
      return { status: 'not_configured' };
    }
    return { status: 'active', provider: integration.provider, region: integration.region };
  }
}
