import { Injectable, Logger, forwardRef, Inject, OnModuleInit } from '@nestjs/common';
import { AwsProvider } from './providers/aws.provider';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class CloudIntegrationsService implements OnModuleInit {
  private readonly logger = new Logger(CloudIntegrationsService.name);
  
  constructor(
    private readonly awsProvider: AwsProvider,
    private readonly tenantsService: TenantsService
  ) {}

  onModuleInit() {
    this.logger.log('Starting background polling for AWS CloudTrail logs...');
    // Poll every 3 minutes (180,000 ms)
    setInterval(() => {
      this.syncAllAwsLogs();
    }, 3 * 60 * 1000);
  }

  async syncAllAwsLogs() {
    try {
      const orgs = await this.tenantsService.getAllOrganizationsWithAws();
      for (const org of orgs) {
        if (org.aws_access_key && org.aws_secret_key) {
          const credentials = {
            accessKeyId: org.aws_access_key,
            secretAccessKey: org.aws_secret_key,
            region: org.aws_region || 'ap-south-1'
          };
          this.logger.debug(`Polling AWS logs for org ${org.id}`);
          await this.awsProvider.fetchCloudTrailLogs(credentials, org.id, 15); // fetch last 15 min
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to background sync AWS logs: ${err.message}`);
    }
  }

  async addAwsIntegration(orgId: string, credentials: any) {
    this.logger.log(`Adding AWS integration for org ${orgId}`);
    
    // Save to DB
    await this.tenantsService.updateSettings(orgId, {
      aws_access_key: credentials.accessKeyId,
      aws_secret_key: credentials.secretAccessKey,
      aws_region: credentials.region
    });

    // Do an initial fetch
    const eventsFetched = await this.awsProvider.fetchCloudTrailLogs(credentials, orgId, 60); // fetch last 1 hour
    
    return { success: true, eventsFetched };
  }

  async syncAwsLogs(orgId: string) {
    const org = await this.tenantsService.getOrganizationDetails(orgId);
    if (!org.aws_access_key || !org.aws_secret_key) {
      throw new Error('AWS integration not found for this org');
    }

    const credentials = {
      accessKeyId: org.aws_access_key,
      secretAccessKey: org.aws_secret_key,
      region: org.aws_region || 'ap-south-1'
    };

    return this.awsProvider.fetchCloudTrailLogs(credentials, orgId, 15);
  }

  async getIntegrationStatus(orgId: string) {
    const org = await this.tenantsService.getOrganizationDetails(orgId);
    if (!org.aws_access_key) {
      return { status: 'not_configured' };
    }
    return { status: 'active', provider: 'aws', region: org.aws_region };
  }
}
