import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'prompt_page' })
export class PromptPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  pageTitle: string;

  @Column({ type: 'text', nullable: true })
  pageDescription: string;

  @Column({ type: 'text', nullable: true })
  contentSummary: string;
}
