import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RelumePage } from './relume-page.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  value: string;

  @ManyToOne(() => RelumePage, (page) => page.tags, { onDelete: 'CASCADE' })
  page: RelumePage;
}
