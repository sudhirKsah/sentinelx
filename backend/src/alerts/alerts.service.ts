import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createAlert(data: any, orgId: string) {
    const alert = this.alertRepository.create({
      ...data,
      org_id: orgId,
      status: 'new',
      triggered_at: new Date(),
    });
    const savedAlert = await this.alertRepository.save(alert);
    
    // Broadcast real-time
    this.eventsGateway.broadcastAlert(orgId, savedAlert);
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
