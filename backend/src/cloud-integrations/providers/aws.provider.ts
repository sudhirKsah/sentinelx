import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { EventsService } from '../../events/events.service';

@Injectable()
export class AwsProvider {
  private readonly logger = new Logger(AwsProvider.name);

  constructor(private readonly eventsService: EventsService) {}

  async fetchCloudTrailLogs(credentials: any, orgId: string, lookbackMinutes = 15) {
    try {
      const cloudtrail = new AWS.CloudTrail({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        region: credentials.region || 'us-east-1',
      });

      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - lookbackMinutes);

      const params = {
        StartTime: startTime,
        EndTime: new Date(),
      };

      this.logger.log(`Fetching CloudTrail logs for org ${orgId} since ${startTime.toISOString()}`);
      
      const response = await cloudtrail.lookupEvents(params).promise();
      
      if (!response.Events || response.Events.length === 0) {
        this.logger.log(`No new CloudTrail events for org ${orgId}`);
        return 0;
      }

      let count = 0;
      for (const event of response.Events) {
        // Parse the CloudTrail event
        const rawEventData = JSON.parse(event.CloudTrailEvent || '{}');
        
        // Map to SentinelX Event structure
        await this.eventsService.ingestEvent({
          event_type: `aws:cloudtrail:${event.EventName}`,
          source: 'aws',
          severity: this.determineSeverity(event.EventName || ''),
          title: `AWS Event: ${event.EventName}`,
          description: `User ${event.Username} performed ${event.EventName} on resource ${event.Resources?.[0]?.ResourceName || 'unknown'}`,
          raw_data: rawEventData,
          timestamp: event.EventTime,
        }, orgId);
        
        count++;
      }

      this.logger.log(`Successfully ingested ${count} AWS events for org ${orgId}`);
      return count;
    } catch (error: any) {
      this.logger.error(`Error fetching CloudTrail logs for org ${orgId}: ${error.message}`);
      throw error;
    }
  }

  private determineSeverity(eventName: string): string {
    // S3 Bucket Modifications & Ransomware Indicators
    const s3CriticalEvents = ['DeleteBucket', 'PutBucketPolicy', 'PutBucketPublicAccessBlock', 'DeleteBucketCors', 'DeleteBucketEncryption', 'DeleteBucketLifecycle', 'DeleteBucketReplication'];
    
    // IAM Privilege Escalation
    const iamCriticalEvents = ['CreateUser', 'AttachUserPolicy', 'AttachGroupPolicy', 'AttachRolePolicy', 'PutUserPolicy', 'CreateAccessKey', 'CreateLoginProfile', 'UpdateLoginProfile'];
    
    // Defense Evasion / CloudTrail Disabling
    const evasionCriticalEvents = ['StopLogging', 'DeleteTrail', 'UpdateTrail', 'DeleteFlowLogs', 'DeleteDetector'];
    
    // Network / Security Group Changes
    const networkHighEvents = ['AuthorizeSecurityGroupIngress', 'AuthorizeSecurityGroupEgress', 'RevokeSecurityGroupIngress', 'CreateNetworkAclEntry', 'ReplaceNetworkAclEntry'];
    
    // Suspicious Logins & API Abuse
    const loginHighEvents = ['ConsoleLogin', 'AssumeRole'];
    const apiAbuseHighEvents = ['RunInstances', 'CreateDBInstance', 'CreateCluster'];
    
    // Reconnaissance Activity
    const reconEvents = ['DescribeInstances', 'ListBuckets', 'GetCallerIdentity', 'DescribeTrails', 'ListRoles'];

    if ([...s3CriticalEvents, ...iamCriticalEvents, ...evasionCriticalEvents].includes(eventName)) return 'critical';
    if ([...networkHighEvents, ...loginHighEvents, ...apiAbuseHighEvents].includes(eventName)) return 'high';
    if (reconEvents.includes(eventName)) return 'medium'; // Can elevate to 'high' if volume is large, but 'medium' for now

    return 'info';
  }
}
