import { Module } from '@nestjs/common';
import { CloudIntegrationsService } from './cloud-integrations.service';
import { CloudIntegrationsController } from './cloud-integrations.controller';
import { AwsProvider } from './providers/aws.provider';
import { GcpProvider } from './providers/gcp.provider';
import { EventsModule } from '../events/events.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [EventsModule, TenantsModule],
  controllers: [CloudIntegrationsController],
  providers: [CloudIntegrationsService, AwsProvider, GcpProvider],
  exports: [CloudIntegrationsService],
})
export class CloudIntegrationsModule {}
