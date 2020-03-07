import { BaseEntity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class ExtendedEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: string;
}
