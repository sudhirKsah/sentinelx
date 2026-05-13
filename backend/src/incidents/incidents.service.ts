import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './entities/incident.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createIncident(data: any, orgId: string) {
    const incident = this.incidentRepository.create({
      ...data,
      org_id: orgId,
      status: 'open',
    });
    const savedIncident = await this.incidentRepository.save(incident);
    this.eventsGateway.broadcastIncident(orgId, savedIncident);
    return savedIncident;
  }

  async getIncidentsForOrg(orgId: string, limit = 50) {
    return this.incidentRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async updateIncidentStatus(incidentId: string, status: string, orgId: string) {
    const incident = await this.incidentRepository.findOne({ where: { id: incidentId, org_id: orgId } });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    incident.status = status;
    if (status === 'resolved') {
      incident.resolved_at = new Date();
    }
    return this.incidentRepository.save(incident);
  }
}
