import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async ingestEvent(@Body() body: any, @Request() req: any) {
    // The user's orgId is attached to the request by the JwtStrategy
    const orgId = req.user.orgId;
    return this.eventsService.ingestEvent(body, orgId);
  }

  @Get()
  async getEvents(@Request() req: any, @Query('limit') limit?: number) {
    const orgId = req.user.orgId;
    return this.eventsService.getEventsForOrg(orgId, limit || 100);
  }
}
