import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../tenants/entities/organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  org_id!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ default: false })
  mfa_enabled!: boolean;

  @Column({ nullable: true })
  mfa_secret?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
