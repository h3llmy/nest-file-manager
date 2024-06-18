import { File } from '../../files/entities/file.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AccessControl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_access_control',
  })
  users: User[];

  @ManyToOne(() => User)
  grantedBy: User;

  @ManyToOne(() => File, (file) => file.accessControls)
  file: File;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  canRead: boolean;

  @Column({ type: 'boolean', default: false })
  canWrite: boolean;

  @Column({ type: 'boolean', default: false })
  canDelete: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
