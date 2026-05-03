import { Injectable, Logger } from '@nestjs/common';
import { IncidentsService } from '../incidents/incidents.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class CorrelationService {
  private readonly logger = new Logger(CorrelationService.name);

  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly alertsService: AlertsService,
  ) {}

  /**
   * Correlates an incoming alert to existing open incidents.
   * If it relates to an open incident, it updates it.
   * If not, it creates a new incident.
   */
  async correlateAlert(alert: any, orgId: string) {
    this.logger.log(`Correlating alert ${alert.id} for org ${orgId}`);

    // In a real SOAR platform, you'd check entity relationships (IPs, Usernames).
    // For MVP: simply find the most recent open incident.
    const openIncidents = await this.incidentsService.getIncidentsForOrg(orgId, 1);
    const activeIncident = openIncidents.find(i => i.status === 'open');

    if (activeIncident) {
      // Link alert to this incident
      // activeIncident.event_count += 1; // You could increment event count
      return activeIncident;
    } else {
      // Create a new incident
      return this.incidentsService.createIncident({
        title: `Incident from Alert: ${alert.title}`,
        description: alert.description,
        severity: alert.severity,
      }, orgId);
    }
  }
}
