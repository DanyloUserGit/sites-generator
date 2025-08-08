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

  @OneToOne(() => Page, (page) => page.content, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ type: 'text', nullable: true })
  heroTitle: string;

  @Column({ type: 'text', nullable: true })
  heroDescription: string;

  @Column({ type: 'text', nullable: true })
  heroCtaText: string;

  @Column({ type: 'text', nullable: true })
  ctaDescription: string;

  @Column({ type: 'text', nullable: true })
  findUsText: string;

  @Column({ type: 'text', nullable: true })
  contactNameText: string;

  @Column({ type: 'text', nullable: true })
  contactMessageText: string;

  @Column({ type: 'text', nullable: true })
  benefitsTitle: string;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ type: 'jsonb', nullable: true })
  aboutServicesTitle: string[];

  @Column({ type: 'jsonb', nullable: true })
  aboutServicesDescription: string[];

  @Column({ type: 'text', nullable: true })
  formText: string;

  @Column({ type: 'text', nullable: true })
  backgroundImageUrl: string;

  @Column({ type: 'text', nullable: true })
  mapImageUrl: string;

  @Column({ type: 'text', nullable: true })
  heroCtaImg: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
