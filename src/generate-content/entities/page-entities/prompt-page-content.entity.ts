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
  ctaDescription: string;

  @Column({ type: 'text', nullable: true })
  benefitsTitle: string;

  @Column({ type: 'text', nullable: true })
  benefitsList: string;

  @Column({ type: 'text', nullable: true })
  aboutServicesTitle: string;

  @Column({ type: 'text', nullable: true })
  aboutServicesDescription: string;

  @Column({ type: 'text', nullable: true })
  formText: string;

  @Column({ type: 'text', nullable: true })
  aiRole: string;
}
