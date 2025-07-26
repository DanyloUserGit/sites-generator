import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'prompt_site' })
export class PromptSite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  companyName: string;

  @Column({ type: 'text', nullable: true })
  aiRole: string;
}
