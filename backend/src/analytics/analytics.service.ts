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

  async getAiAnalytics(orgId: string) {
    const alerts = await this.alertsService.getAlertsForOrg(orgId, 500);
    
    // Calculate last 7 days confidence scores based on AI alerts
    const days = 7;
    const scores: number[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      
      const dayAlerts = alerts.filter(a => {
        const aDate = new Date(a.created_at);
        return aDate.getDate() === d.getDate() && aDate.getMonth() === d.getMonth();
      });

      // Find average confidence score for the day, or random baseline if no alerts
      let dailyScore = 15 + Math.floor(Math.random() * 10); // Baseline normal
      if (dayAlerts.length > 0) {
        // Try to extract AI confidence from description (e.g. "[AI Confidence: 95%]")
        let totalConf = 0;
        let aiCount = 0;
        dayAlerts.forEach(a => {
          const match = a.description?.match(/Confidence:\s*(\d+)%/);
          if (match && match[1]) {
            totalConf += parseInt(match[1]);
            aiCount++;
          }
        });
        if (aiCount > 0) {
          dailyScore = Math.round(totalConf / aiCount);
        }
      }
      scores.push(dailyScore);
    }

    // Calculate baseline deviations
    const highSeverityCount = alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;
    const loginDeviation = Math.min(85, 10 + (highSeverityCount * 5));
    const dataExfilRisk = Math.min(60, 5 + (highSeverityCount * 3));
    const privEscRisk = Math.min(40, 2 + (highSeverityCount * 2));

    return {
      confidenceScores: scores,
      deviations: {
        login: loginDeviation,
        dataExfil: dataExfilRisk,
        privEsc: privEscRisk,
      }
    };
  }
}
