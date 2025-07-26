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

  @OneToOne(() => Page, (page) => page.content, { onDelete: 'CASCADE' })
  page: Page;

  @Column({ type: 'text', nullable: true })
  heroTitle: string;

  @Column({ type: 'text', nullable: true })
  heroDescription: string;

  @Column({ type: 'text', nullable: true })
  heroCtaText: string;

  @Column({ type: 'text', nullable: true })
  heroCtaUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

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
