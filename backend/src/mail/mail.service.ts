import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendAlertEmail(to: string, alert: any) {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(`Email alerts enabled but RESEND_API_KEY is missing. Would have sent to ${to}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'SentinelX Security <onboarding@resend.dev>',
        to: [to],
        subject: `[SentinelX ALERT] ${alert.severity.toUpperCase()} - ${alert.title}`,
        html: `
          <h2>SentinelX Security Alert</h2>
          <p><strong>Severity:</strong> <span style="color: red;">${alert.severity.toUpperCase()}</span></p>
          <p><strong>Title:</strong> ${alert.title}</p>
          <p><strong>Description:</strong> ${alert.description}</p>
          <hr/>
          <p>Please log in to your SentinelX dashboard to investigate.</p>
        `,
      });

      if (error) {
        this.logger.error(`Failed to send alert email: ${error.message}`);
      } else {
        this.logger.log(`Alert email sent to ${to}: ${data?.id}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send alert email: ${err.message}`);
    }
  }

  async sendInviteEmail(to: string, orgName: string) {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(`RESEND_API_KEY is missing. Would have sent invite to ${to}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'SentinelX Admin <onboarding@resend.dev>',
        to: [to],
        subject: `You've been invited to join ${orgName} on SentinelX`,
        html: `
          <h2>Welcome to SentinelX</h2>
          <p>You have been invited to join the <strong>${orgName}</strong> organization.</p>
          <p>Please log in to your SentinelX dashboard to accept the invitation and access your security overview.</p>
        `,
      });

      if (error) {
        this.logger.error(`Failed to send invite email: ${error.message}`);
      } else {
        this.logger.log(`Invite email sent to ${to}: ${data?.id}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send invite email: ${err.message}`);
    }
  }
}
