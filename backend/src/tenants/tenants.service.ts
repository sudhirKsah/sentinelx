import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './entities/organization.entity';
import { User } from '../auth/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async getOrganizationDetails(orgId: string) {
    const org = await this.orgRepository.findOne({ where: { id: orgId }, relations: ['users'] });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async getAllOrganizationsWithAws() {
    return this.orgRepository
      .createQueryBuilder('org')
      .where('org.aws_access_key IS NOT NULL')
      .getMany();
  }

  async inviteUser(orgId: string, email: string) {
    // Generate a secure random password for the invited user
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    const newUser = this.userRepository.create({
      email,
      password_hash: hashedPassword,
      org_id: orgId
    });
    
    const savedUser = await this.userRepository.save(newUser);
    
    // Send email via Resend
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (org) {
      await this.mailService.sendInviteEmail(email, org.name);
    }
    
    return savedUser;
  }

  async updateSettings(orgId: string, settings: any) {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (settings.aws_access_key !== undefined) org.aws_access_key = settings.aws_access_key;
    if (settings.aws_secret_key !== undefined) org.aws_secret_key = settings.aws_secret_key;
    if (settings.aws_region !== undefined) org.aws_region = settings.aws_region;
    if (settings.email_alerts_enabled !== undefined) org.email_alerts_enabled = settings.email_alerts_enabled;
    if (settings.alert_email_address !== undefined) org.alert_email_address = settings.alert_email_address;

    return this.orgRepository.save(org);
  }
}
