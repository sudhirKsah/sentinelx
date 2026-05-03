import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { AlertsService } from '../alerts/alerts.service';
import { IncidentsService } from '../incidents/incidents.service';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly alertsService: AlertsService,
    private readonly incidentsService: IncidentsService,
    private readonly agentsService: AgentsService,
  ) {}

  async getDashboardStats(orgId: string) {
    const events = await this.eventsService.getEventsForOrg(orgId, 100);
    const alerts = await this.alertsService.getAlertsForOrg(orgId, 100);
    const incidents = await this.incidentsService.getIncidentsForOrg(orgId, 100);
    const agents = await this.agentsService.getAgentsForOrg(orgId);

    const activeAlerts = alerts.filter(a => a.status === 'new').length;
    const openIncidents = incidents.filter(i => i.status === 'open').length;
    const activeAgents = agents.filter(a => a.status === 'online').length;

    return {
      totalEvents: events.length,
      activeAlerts,
      openIncidents,
      activeAgents,
    };
  }
}
