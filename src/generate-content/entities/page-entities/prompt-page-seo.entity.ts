import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'prompt_page_seo' })
export class PromptPageSeo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  keywords: string;

  @Column({ type: 'text', nullable: true })
  schemaOrg: string;
}
