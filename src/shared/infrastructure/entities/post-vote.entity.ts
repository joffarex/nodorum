import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { VoteType } from '../../../domain/forum-aggregate';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';

@Entity({ name: 'postVotes' })
export class PostVoteEntity extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'integer' })
  type!: VoteType;

  @ManyToOne(() => UserEntity, (user) => user.postVotes)
  user!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.votes)
  post!: PostEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: Date;
}
