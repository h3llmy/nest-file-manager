import { AccessControl } from '../../access-controll/entities/access-controll.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
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

  @OneToMany(() => AccessControl, (accessControl) => accessControl.file)
  accessControls: AccessControl[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
