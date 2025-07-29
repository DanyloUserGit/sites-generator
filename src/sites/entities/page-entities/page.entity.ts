import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from '../site.entity';
import { PageSeo } from './page-seo.entity';
import { PageContent } from './page-content.entiy';

@Entity({ name: 'pages' })
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Site, (site) => site.pages, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @OneToOne(() => PageSeo, (seo) => seo.page, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'seo_id' })
  seo: PageSeo;

  @OneToOne(() => PageContent, (content) => content.page, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'content_id' })
  content: PageContent;

  @Column({ length: 255 })
  slug: string;

  @Column({ length: 255 })
  pageName: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
