import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'admins' })
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  login: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
