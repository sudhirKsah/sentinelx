import { Module } from '@nestjs/common';
import { CloudIntegrationsService } from './cloud-integrations.service';
import { CloudIntegrationsController } from './cloud-integrations.controller';
import { AwsProvider } from './providers/aws.provider';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [CloudIntegrationsController],
  providers: [CloudIntegrationsService, AwsProvider],
  exports: [CloudIntegrationsService],
})
export class CloudIntegrationsModule {}
