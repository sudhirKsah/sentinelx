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

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  org_id!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ type: 'uuid', nullable: true })
  incident_id?: string;

  @Column({ length: 255, nullable: true })
  rule_id?: string;

  @Column({ length: 255 })
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ length: 50 })
  severity!: string;

  @Column({ length: 50, default: 'new' })
  status!: string; // new, acknowledged, resolved

  @Column('timestamp', { nullable: true })
  triggered_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
