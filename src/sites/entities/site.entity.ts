import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Page } from './page-entities/page.entity';
import { SiteStatus } from 'src/types';

@Entity({ name: 'sites' })
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  companyName: string;

  @Column({ length: 255 })
  city: string;

  @Column({ length: 500 })
  services: string;

  @Column({ length: 65 })
  language: string;

  @OneToMany(() => Page, (page) => page.site, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  pages: Page[];

  @Column({ type: 'text', nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  deployUrl: string;

  @Column({ type: 'text', nullable: true })
  siteUrl: string;

  @Column({ type: 'text', default: 'Inactive' })
  siteStatus: SiteStatus;

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column({ type: 'text', nullable: true })
  projectId: string;

  @Column({ type: 'text', default: '/contact#form' })
  heroCtaUrl: string;

  @Column({ type: 'text', nullable: true })
  favIcon: string;

  @Column({ type: 'simple-array', nullable: true })
  usedUnsplashIds: string[];

  @Column({ type: 'simple-json', nullable: true })
  navigation: Navigation[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
export class Navigation {
  slug: string;
  linkName: string;
}
