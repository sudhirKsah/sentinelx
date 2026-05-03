import { Module } from '@nestjs/common';
import { CorrelationService } from './correlation.service';
import { IncidentsModule } from '../incidents/incidents.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [IncidentsModule, AlertsModule],
  controllers: [],
  providers: [CorrelationService],
  exports: [CorrelationService],
})
export class CorrelationModule {}
