import { Injectable, Logger, forwardRef, Inject, OnModuleInit } from '@nestjs/common';
import { AwsProvider } from './providers/aws.provider';
import { GcpProvider } from './providers/gcp.provider';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class CloudIntegrationsService implements OnModuleInit {
  private readonly logger = new Logger(CloudIntegrationsService.name);

  constructor(
    private readonly awsProvider: AwsProvider,
    private readonly gcpProvider: GcpProvider,
    private readonly tenantsService: TenantsService
  ) {}

  onModuleInit() {
    this.logger.log('Starting background polling for cloud audit logs (AWS + GCP)...');
    // Poll every 3 minutes (180,000 ms)
    setInterval(() => {
      this.syncAllAwsLogs();
      this.syncAllGcpLogs();
    }, 3 * 60 * 1000);
  }

  // ────────────────────────────── AWS ──────────────────────────────

  async syncAllAwsLogs() {
    try {
      const orgs = await this.tenantsService.getAllOrganizationsWithAws();
      for (const org of orgs) {
        if (org.aws_access_key && org.aws_secret_key) {
          this.logger.debug(`Polling AWS logs for org ${org.id}`);
          const credentials = await this.tenantsService.getDecryptedAwsCredentials(org.id);
          if (!credentials) continue;
          await this.awsProvider.fetchCloudTrailLogs(credentials, org.id, 15); // fetch last 15 min
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to background sync AWS logs: ${err.message}`);
    }
  }

  async addAwsIntegration(orgId: string, credentials: any) {
    this.logger.log(`Adding AWS integration for org ${orgId}`);

    // Save to DB (TenantsService encrypts at rest)
    await this.tenantsService.updateSettings(orgId, {
      aws_access_key: credentials.accessKeyId,
      aws_secret_key: credentials.secretAccessKey,
      aws_region: credentials.region
    });

    // Do an initial fetch using the plaintext credentials the user just submitted
    const eventsFetched = await this.awsProvider.fetchCloudTrailLogs(credentials, orgId, 60); // fetch last 1 hour

    return { success: true, eventsFetched };
  }

  async syncAwsLogs(orgId: string) {
    const credentials = await this.tenantsService.getDecryptedAwsCredentials(orgId);
    if (!credentials) {
      throw new Error('AWS integration not found for this org');
    }
    return this.awsProvider.fetchCloudTrailLogs(credentials, orgId, 15);
  }

  // ────────────────────────────── GCP ──────────────────────────────

  async syncAllGcpLogs() {
    try {
      const orgs = await this.tenantsService.getAllOrganizationsWithGcp();
      for (const org of orgs) {
        if (org.gcp_service_account_key && org.gcp_project_id) {
          this.logger.debug(`Polling GCP audit logs for org ${org.id} (project ${org.gcp_project_id})`);
          const credentials = await this.tenantsService.getDecryptedGcpCredentials(org.id);
          if (!credentials) continue;
          await this.gcpProvider.fetchCloudAuditLogs(credentials, org.id, 15);
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to background sync GCP logs: ${err.message}`);
    }
  }

  async addGcpIntegration(orgId: string, credentials: { serviceAccountKey: string; projectId: string }) {
    this.logger.log(`Adding GCP integration for org ${orgId} (project ${credentials.projectId})`);

    // Validate the JSON early so we don't store garbage
    try {
      JSON.parse(credentials.serviceAccountKey);
    } catch (err: any) {
      throw new Error(`Invalid GCP service account JSON: ${err.message}`);
    }

    // Save to DB (TenantsService encrypts at rest)
    await this.tenantsService.updateSettings(orgId, {
      gcp_service_account_key: credentials.serviceAccountKey,
      gcp_project_id: credentials.projectId,
    });

    // Initial fetch using the plaintext credentials the user just submitted
    const eventsFetched = await this.gcpProvider.fetchCloudAuditLogs(credentials, orgId, 60);

    return { success: true, eventsFetched };
  }

  async syncGcpLogs(orgId: string) {
    const credentials = await this.tenantsService.getDecryptedGcpCredentials(orgId);
    if (!credentials) {
      throw new Error('GCP integration not found for this org');
    }
    return this.gcpProvider.fetchCloudAuditLogs(credentials, orgId, 15);
  }

  // ──────────────────────────── Status ─────────────────────────────

  async getIntegrationStatus(orgId: string) {
    const org: any = await this.tenantsService.getOrganizationDetails(orgId);
    const providers: any[] = [];

    if (org.aws_configured) {
      providers.push({ provider: 'aws', status: 'active', region: org.aws_region });
    } else {
      providers.push({ provider: 'aws', status: 'not_configured' });
    }

    if (org.gcp_configured) {
      providers.push({ provider: 'gcp', status: 'active', projectId: org.gcp_project_id });
    } else {
      providers.push({ provider: 'gcp', status: 'not_configured' });
    }

    return { providers };
  }
}
