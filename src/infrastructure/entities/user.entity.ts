import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@Unique(['username', 'email'])
export class UserEntity extends BaseEntity {
  // @PrimaryGeneratedColumn('uuid')
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  username!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email!: string;

  @Column({ type: 'text', select: false })
  password!: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: string;
}
