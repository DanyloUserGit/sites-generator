import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RelumePage } from './relume-page.entity';

@Entity('relume_sites')
export class RelumeSite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  companyName: string;

  @Column({ length: 255 })
  city: string;

  @Column({ length: 500 })
  services: string;

  @Column({ length: 65 })
  language: string;

  @Column({ type: 'text', nullable: true })
  deployUrl: string;

  @Column({ type: 'text', nullable: true })
  siteUrl: string;

  @OneToMany(() => RelumePage, (page) => page.site, { cascade: true })
  pages: RelumePage[];

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column({ type: 'text', nullable: true })
  projectId: string;

  @Column({ type: 'boolean', default: true })
  relume: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
