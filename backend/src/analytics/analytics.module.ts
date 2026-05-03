import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { EventsModule } from '../events/events.module';
import { AlertsModule } from '../alerts/alerts.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [EventsModule, AlertsModule, IncidentsModule, AgentsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
