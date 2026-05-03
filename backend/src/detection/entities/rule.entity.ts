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

@Entity('detection_rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  org_id!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 50 })
  rule_type!: string; // regex, threshold, correlation

  @Column('jsonb')
  rule_config!: any;

  @Column({ default: true })
  enabled!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
