import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { CloudIntegrationsModule } from './cloud-integrations/cloud-integrations.module';
import { AgentsModule } from './agents/agents.module';
import { EventsModule } from './events/events.module';
import { DetectionModule } from './detection/detection.module';
import { IncidentsModule } from './incidents/incidents.module';
import { CorrelationModule } from './correlation/correlation.module';
import { AlertsModule } from './alerts/alerts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CommonModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'sentinelx'),
        password: configService.get('DB_PASSWORD', 'sentinelx'),
        database: configService.get('DB_NAME', 'sentinelx'),
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('DB_LOGGING', false),
      }),
    }),
    AuthModule,
    TenantsModule,
    CloudIntegrationsModule,
    AgentsModule,
    EventsModule,
    DetectionModule,
    IncidentsModule,
    CorrelationModule,
    AlertsModule,
    AnalyticsModule,
    HealthModule,
    MailModule,
  ],
  controllers: [],
})
export class AppModule {}
