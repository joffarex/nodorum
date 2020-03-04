import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class ExtendedEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: string;
}
