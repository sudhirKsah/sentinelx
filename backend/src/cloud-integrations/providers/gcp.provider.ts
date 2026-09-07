import { Injectable, Logger } from '@nestjs/common';
import { Logging } from '@google-cloud/logging';
import { EventsService } from '../../events/events.service';

interface GcpCredentials {
  serviceAccountKey: string; // raw JSON string
  projectId: string;
}

/**
 * GCP provider — fetches Cloud Audit Logs (Admin Activity & Data Access) via the
 * Cloud Logging API. This is the GCP equivalent of AWS CloudTrail.
 *
 * Required IAM roles on the service account:
 *   - roles/logging.viewer (or roles/logging.privateLogViewer for Data Access logs)
 */
@Injectable()
export class GcpProvider {
  private readonly logger = new Logger(GcpProvider.name);

  constructor(private readonly eventsService: EventsService) {}

  async fetchCloudAuditLogs(credentials: GcpCredentials, orgId: string, lookbackMinutes = 15) {
    let parsedKey: any;
    try {
      parsedKey = JSON.parse(credentials.serviceAccountKey);
    } catch (err: any) {
      this.logger.error(`Invalid GCP service account JSON for org ${orgId}: ${err.message}`);
      throw new Error('Invalid GCP service account key JSON');
    }

    const projectId = credentials.projectId || parsedKey.project_id;
    if (!projectId) {
      throw new Error('GCP project_id is required (pass it explicitly or include it in the service account key)');
    }

    const logging = new Logging({
      projectId,
      credentials: {
        client_email: parsedKey.client_email,
        private_key: parsedKey.private_key,
      },
    });

    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - lookbackMinutes);

    // Cloud Logging advanced filter: Admin Activity + Data Access audit logs since startTime
    const filter = [
      `logName="projects/${projectId}/logs/cloudaudit.googleapis.com%2Factivity"`,
      `logName="projects/${projectId}/logs/cloudaudit.googleapis.com%2Fdata_access"`,
      `timestamp>="${startTime.toISOString()}"`,
    ].join(' OR ');

    this.logger.log(`Fetching GCP Cloud Audit Logs for org ${orgId} (project ${projectId}) since ${startTime.toISOString()}`);

    try {
      const [entries] = await logging.getEntries({
        filter,
        pageSize: 300,
        autoPaginate: false,
        orderBy: 'timestamp desc',
      });

      if (!entries || entries.length === 0) {
        this.logger.log(`No new GCP audit log entries for org ${orgId}`);
        return 0;
      }

      let count = 0;
      for (const entry of entries) {
        const data: any = entry.data || {};
        const protoPayload = data.protoPayload || {};
        const methodName: string = protoPayload.methodName || data.methodName || 'Unknown';
        const resourceName: string = protoPayload.resourceName || data.resourceName || 'unknown';
        const principal: string = protoPayload.authenticationInfo?.principalEmail || data.principalEmail || 'unknown';
        const severity = this.determineSeverity(methodName);

        await this.eventsService.ingestEvent({
          event_type: `gcp:audit:${methodName}`,
          source: 'gcp',
          severity,
          title: `GCP Event: ${methodName}`,
          description: `Principal ${principal} performed ${methodName} on resource ${resourceName}`,
          raw_data: {
            projectId,
            methodName,
            resourceName,
            principalEmail: principal,
            serviceName: protoPayload.serviceName || data.serviceName,
            severity: data.severity,
            insertId: data.insertId,
            timestamp: data.timestamp || entry.metadata?.timestamp,
            protoPayload,
          },
          timestamp: data.timestamp || entry.metadata?.timestamp || new Date().toISOString(),
        }, orgId);

        count++;
      }

      this.logger.log(`Successfully ingested ${count} GCP audit events for org ${orgId}`);
      return count;
    } catch (error: any) {
      this.logger.error(`Error fetching GCP audit logs for org ${orgId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map GCP audit method names to SentinelX severity buckets.
   * Reference: https://cloud.google.com/logging/docs/audit/configure-data-access
   */
  private determineSeverity(methodName: string): string {
    if (!methodName) return 'info';

    // Critical: destructive / privilege-escalating operations
    const criticalPatterns = [
      'DeleteBucket', 'DeleteProject', 'DeleteServiceAccount',
      'CreateServiceAccount', 'CreateServiceAccountKey',
      'SetIamPolicy', 'DeleteFirewall', 'DeleteRoute',
      'DeleteSink', 'UpdateSink',
    ];
    // High: network/security changes, instance creation, logins
    const highPatterns = [
      'Insert', 'Create', 'Update', 'Patch',
      'SetBucketPolicy', 'AddMember', 'RemoveMember',
      'google.iam.serviceAccount.keys.create',
      'SetMetadata', 'PatchFirewall', 'InsertFirewall',
    ];
    const highKeywords = ['Login', 'Signin', 'Token', 'AssumeRole', 'Authorize'];
    // Recon: list/describe style read operations
    const reconKeywords = ['List', 'Get', 'Describe', 'AggregatedList'];

    if (criticalPatterns.some((p) => methodName.includes(p))) return 'critical';
    if (highPatterns.some((p) => methodName.includes(p))) return 'high';
    if (highKeywords.some((k) => methodName.toLowerCase().includes(k.toLowerCase()))) return 'high';
    if (reconKeywords.some((k) => methodName.includes(k))) return 'medium';

    return 'info';
  }
}
