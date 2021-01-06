import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';
import { PostVoteEntity } from './post-vote.entity';
import { CommentVoteEntity } from './comment-vote.entity';

@Entity({ name: 'comments' })
export class CommentEntity extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column('text')
  text!: string;

  @Column({ type: 'integer', unsigned: true, nullable: true })
  parentCommentId!: string | null;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  user!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  post!: PostEntity;

  @OneToMany(() => CommentVoteEntity, (commentVote) => commentVote.comment)
  votes!: CommentVoteEntity[];

  @Column({ type: 'integer' })
  points!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: Date;
}
