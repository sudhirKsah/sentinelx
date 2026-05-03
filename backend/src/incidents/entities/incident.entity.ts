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

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  org_id!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ length: 255 })
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ length: 50 })
  severity!: string;

  @Column({ length: 50, default: 'open' })
  status!: string; // open, investigating, resolved

  @Column('float', { default: 0.0 })
  risk_score!: number;

  @Column('int', { default: 0 })
  event_count!: number;

  @Column('timestamp', { nullable: true })
  resolved_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
