import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RelumeSite } from './relume-site.entity';
import { Tag } from './tag.entity';
import { RelumePageSeo } from './relume-page-seo';

@Entity('relume_pages')
export class RelumePage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => RelumePageSeo, (seo) => seo.page, {
    cascade: true,
    eager: true,
  })
  seo: RelumePageSeo;

  @Column()
  name: string;

  @ManyToOne(() => RelumeSite, (site) => site.pages, { onDelete: 'CASCADE' })
  site: RelumeSite;

  @OneToMany(() => Tag, (tag) => tag.page, { cascade: true })
  tags: Tag[];
}
