import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'free' })
  plan!: string; // free, starter, professional, enterprise

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];

  // Integration Settings
  @Column({ nullable: true })
  aws_access_key?: string;

  @Column({ nullable: true })
  aws_secret_key?: string;

  @Column({ nullable: true, default: 'ap-south-1' })
  aws_region?: string;

  // GCP Integration Settings
  // Stored as the raw JSON service account key (contains client_email, private_key, project_id).
  @Column({ type: 'text', nullable: true })
  gcp_service_account_key?: string;

  @Column({ nullable: true })
  gcp_project_id?: string;

  // Notification Settings
  @Column({ default: false })
  email_alerts_enabled!: boolean;

  @Column({ nullable: true })
  alert_email_address?: string;
}
