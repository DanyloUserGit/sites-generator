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

  @Column({ length: 255 })
  city: string;

  @Column({ length: 500 })
  services: string;

  @Column({ length: 65 })
  language: string;

  @OneToMany(() => Page, (page) => page.site, { cascade: true })
  pages: Page[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
