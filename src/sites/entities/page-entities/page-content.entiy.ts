import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from './page.entity';

@Entity({ name: 'page_content' })
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ type: 'text', nullable: true })
  backgroundImageUrl: string;

  @Column({ type: 'text', nullable: true })
  sectionIconSvg: string;

  @Column({ length: 255, nullable: true })
  heroTitle: string;

  @Column({ type: 'text', nullable: true })
  heroDescription: string;

  @Column({ length: 255, nullable: true })
  heroCtaText: string;

  @Column({ length: 255, nullable: true })
  heroCtaUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ type: 'text', nullable: true })
  formHtml: string;

  @Column({ type: 'text', nullable: true })
  mapImageUrl: string;

  @Column({ length: 255, nullable: true })
  footerCompanyName: string;

  @Column({ length: 255, nullable: true })
  footerMenu: string;

  @Column({ length: 4, nullable: true })
  footerYear: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
