import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'prompt_page_content' })
export class PromptPageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  heroTitle: string;

  @Column({ type: 'text', nullable: true })
  heroDescription: string;

  @Column({ type: 'text', nullable: true })
  heroCta: string;

  @Column({ type: 'text', nullable: true })
  benefitsList: string;

  @Column({ type: 'text', nullable: true })
  formSection: string;

  @Column({ type: 'text', nullable: true })
  mapSection: string;

  @Column({ type: 'text', nullable: true })
  footerSection: string;
}
