import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from './page.entity';

@Entity({ name: 'page_seo' })
export class PageSeo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Page, (page) => page.seo, { onDelete: 'CASCADE' })
  page: Page;

  @Column({ length: 255 })
  metaTitle: string;

  @Column({ length: 255 })
  metaDescription: string;

  @Column({ type: 'text' })
  keywords: string;

  @Column({ type: 'jsonb', nullable: true })
  schemaOrg: Record<string, any>;

  @UpdateDateColumn()
  updatedAt: Date;
}
