import { MimeType } from '@app/formdata';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.files)
  owner: User;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ default: false })
  hidden: boolean;

  @Column({ type: 'int' })
  size: number;

  @Column()
  mimeType: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: number;
}
