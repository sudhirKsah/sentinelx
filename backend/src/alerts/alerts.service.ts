import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { EventsGateway } from '../events/events.gateway';
import { TenantsService } from '../tenants/tenants.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
    private readonly tenantsService: TenantsService,
    private readonly mailService: MailService,
  ) {}

  async createAlert(data: Partial<Alert>, orgId: string) {
    const alert = this.alertRepository.create({
      ...data,
      org_id: orgId,
      status: 'new',
      triggered_at: new Date(),
    });
    const savedAlert = await this.alertRepository.save(alert);
    
    // Broadcast real-time
    this.eventsGateway.broadcastAlert(orgId, savedAlert);

    // Send Email if enabled and severity is high/critical
    if (savedAlert.severity === 'high' || savedAlert.severity === 'critical') {
      const org = await this.tenantsService.getOrganizationDetails(orgId);
      if (org && org.email_alerts_enabled && org.alert_email_address) {
        await this.mailService.sendAlertEmail(org.alert_email_address, savedAlert);
      }
    }

    return savedAlert;
  }

  async getAlertsForOrg(orgId: string, limit = 50) {
    return this.alertRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async updateAlertStatus(alertId: string, status: string, orgId: string) {
    const alert = await this.alertRepository.findOne({ where: { id: alertId, org_id: orgId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    alert.status = status;
    return this.alertRepository.save(alert);
  }
}
