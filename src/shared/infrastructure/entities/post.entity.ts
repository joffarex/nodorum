import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostType } from '../../../domain/forum-aggregate';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { PostVoteEntity } from './post-vote.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  type!: PostType;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  title!: string;

  @Column({ type: 'text', nullable: true })
  text!: string | undefined;

  @Column({ type: 'text', nullable: true })
  link!: string | undefined;

  @Column({ type: 'integer' })
  points!: number;

  @Column({ type: 'integer' })
  totalComments!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'current_timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @Index()
  user!: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments!: CommentEntity[];

  @OneToMany(() => PostVoteEntity, (postVote) => postVote.post)
  votes!: PostVoteEntity[];
}
