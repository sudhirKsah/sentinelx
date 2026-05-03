import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { Event } from './entities/event.entity';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    forwardRef(() => AlertsModule),
    TypeOrmModule.forFeature([Event]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret-key-change-in-prod',
      }),
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
