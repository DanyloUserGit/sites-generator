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

@Entity({ name: 'pages' })
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Site, (site) => site.pages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @OneToOne(() => PageSeo, (seo) => seo.page, { cascade: true, eager: true })
  @JoinColumn({ name: 'seo_id' })
  seo: PageSeo;

  @Column({ length: 255 })
  slug: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
