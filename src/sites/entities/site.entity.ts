import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Page } from './page-entities/page.entity';

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
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  pages: Page[];

  @Column({ type: 'text', nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  favIcon: string;

  @Column({ type: 'simple-array', nullable: true })
  usedUnsplashIds: string[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
