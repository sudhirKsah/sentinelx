import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../tenants/entities/organization.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  org_id!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ name: 'event_type', length: 100 })
  event_type!: string;

  @Column({ length: 100 })
  source!: string;

  @Column({ length: 50 })
  severity!: string;

  @Column({ length: 255 })
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('jsonb', { nullable: true })
  raw_data?: any;

  @Column('timestamp')
  timestamp!: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
