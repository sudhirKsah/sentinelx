import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './entities/organization.entity';
import { User } from '../auth/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { CryptoService } from '../common/crypto.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Returns the org with sensitive credential fields MASKED and `*_configured`
   * booleans added. Safe to return to the frontend.
   * Use getDecryptedAwsCredentials / getDecryptedGcpCredentials for internal use.
   */
  async getOrganizationDetails(orgId: string) {
    const org = await this.orgRepository.findOne({ where: { id: orgId }, relations: ['users'] });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return this.toSafeView(org);
  }

  /** Raw org row (with encrypted credentials intact). Internal use only. */
  private async getRawOrg(orgId: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  /** Mask sensitive fields and add configured booleans for safe API responses. */
  private toSafeView(org: Organization) {
    const safe: any = { ...org };
    safe.aws_configured = !!(org.aws_access_key && org.aws_secret_key);
    safe.gcp_configured = !!(org.gcp_service_account_key && org.gcp_project_id);
    // Never expose raw secrets (encrypted or otherwise) to the client
    safe.aws_access_key = org.aws_access_key ? this.cryptoService.mask(org.aws_access_key) : null;
    delete safe.aws_secret_key;
    delete safe.gcp_service_account_key;
    // Keep non-sensitive integration metadata
    if (org.gcp_project_id) safe.gcp_project_id = org.gcp_project_id;
    return safe;
  }

  async getAllOrganizationsWithAws() {
    return this.orgRepository
      .createQueryBuilder('org')
      .where('org.aws_access_key IS NOT NULL')
      .getMany();
  }

  async getAllOrganizationsWithGcp() {
    return this.orgRepository
      .createQueryBuilder('org')
      .where('org.gcp_service_account_key IS NOT NULL')
      .andWhere('org.gcp_project_id IS NOT NULL')
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
    const org = await this.getRawOrg(orgId);

    // Encrypt sensitive credentials at rest before persisting.
    // encrypt() is idempotent (already-encrypted values pass through unchanged),
    // and empty strings are preserved so a field can be cleared.
    if (settings.aws_access_key !== undefined) {
      org.aws_access_key = settings.aws_access_key ? this.cryptoService.encrypt(settings.aws_access_key) : '';
    }
    if (settings.aws_secret_key !== undefined) {
      org.aws_secret_key = settings.aws_secret_key ? this.cryptoService.encrypt(settings.aws_secret_key) : '';
    }
    if (settings.aws_region !== undefined) org.aws_region = settings.aws_region;
    if (settings.gcp_service_account_key !== undefined) {
      org.gcp_service_account_key = settings.gcp_service_account_key ? this.cryptoService.encrypt(settings.gcp_service_account_key) : '';
    }
    if (settings.gcp_project_id !== undefined) org.gcp_project_id = settings.gcp_project_id;
    if (settings.email_alerts_enabled !== undefined) org.email_alerts_enabled = settings.email_alerts_enabled;
    if (settings.alert_email_address !== undefined) org.alert_email_address = settings.alert_email_address;

    await this.orgRepository.save(org);
    return this.toSafeView(org);
  }

  /** Decrypted AWS credentials for internal use (cloud-integrations polling). */
  async getDecryptedAwsCredentials(orgId: string) {
    const org = await this.getRawOrg(orgId);
    if (!org.aws_access_key || !org.aws_secret_key) return null;
    return {
      accessKeyId: this.cryptoService.decrypt(org.aws_access_key),
      secretAccessKey: this.cryptoService.decrypt(org.aws_secret_key),
      region: org.aws_region || 'ap-south-1',
    };
  }

  /** Decrypted GCP credentials for internal use (cloud-integrations polling). */
  async getDecryptedGcpCredentials(orgId: string) {
    const org = await this.getRawOrg(orgId);
    if (!org.gcp_service_account_key || !org.gcp_project_id) return null;
    return {
      serviceAccountKey: this.cryptoService.decrypt(org.gcp_service_account_key),
      projectId: org.gcp_project_id,
    };
  }
}
