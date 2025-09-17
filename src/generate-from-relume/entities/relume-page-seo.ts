import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RelumePage } from './relume-page.entity';

@Entity({ name: 'relume_page_seo' })
export class RelumePageSeo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => RelumePage, (page) => page.seo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page: RelumePage;

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
