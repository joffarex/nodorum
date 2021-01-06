import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { VoteType } from '../../../domain/forum-aggregate';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';

@Entity({ name: 'commentVotes' })
export class CommentVoteEntity extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'integer' })
  type!: VoteType;

  @ManyToOne(() => UserEntity, (user) => user.commentVotes)
  user!: UserEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.votes)
  comment!: CommentEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: Date;
}
