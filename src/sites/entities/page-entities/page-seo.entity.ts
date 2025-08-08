import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from './page.entity';

@Entity({ name: 'page_seo' })
export class PageSeo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Page, (page) => page.seo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ type: 'text', nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  keywords: string[];

  @Column({ type: 'jsonb', nullable: true })
  schemaOrg: Record<string, any>;

  @UpdateDateColumn()
  updatedAt: Date;
}
