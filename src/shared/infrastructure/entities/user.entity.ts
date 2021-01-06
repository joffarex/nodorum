import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';
import { CommentVoteEntity } from './comment-vote.entity';
import { PostVoteEntity } from './post-vote.entity';

@Entity({ name: 'users' })
@Unique(['username', 'email'])
export class UserEntity extends BaseEntity {
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
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts!: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments!: CommentEntity[];

  @OneToMany(() => CommentVoteEntity, (postVote) => postVote.user)
  commentVotes!: CommentVoteEntity[];

  @OneToMany(() => PostVoteEntity, (commentVote) => commentVote.user)
  postVotes!: PostVoteEntity[];
}
