import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async getMyOrganization(@Request() req: any) {
    return this.tenantsService.getOrganizationDetails(req.user.orgId);
  }

  @Post('invite')
  async inviteUser(@Request() req: any, @Body() body: { email: string }) {
    return this.tenantsService.inviteUser(req.user.orgId, body.email);
  }

  @Patch('me/settings')
  async updateSettings(@Request() req: any, @Body() body: any) {
    return this.tenantsService.updateSettings(req.user.orgId, body);
  }
}
