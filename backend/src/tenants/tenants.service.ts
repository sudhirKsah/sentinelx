import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './entities/organization.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getOrganizationDetails(orgId: string) {
    const org = await this.orgRepository.findOne({ where: { id: orgId }, relations: ['users'] });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
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
    
    return this.userRepository.save(newUser);
  }
}
