import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'prompt_site' })
export class PromptSite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  siteDescription: string;

  @Column({ type: 'text', nullable: true })
  siteTitle: string;
}
