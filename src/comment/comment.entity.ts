import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { UserEntity } from '../user/user.entity';
import { PostEntity } from '../post/post.entity';
import { PostVoteEntity } from '../post/post-vote.entity';

@Entity({ name: 'comments' })
@Index(['post', 'parentId'])
@Index(['post', 'parentId', 'user'])
export class CommentEntity extends ExtendedEntity {
  @Column('text')
  text!: string;

  @Column({ type: 'integer', unsigned: true, nullable: true })
  parentId!: number | null;

  @ManyToOne(
    () => UserEntity,
    user => user.comments,
  )
  user!: UserEntity;

  @ManyToOne(
    () => PostEntity,
    post => post.comments,
  )
  post!: PostEntity;

  @OneToMany(
    () => PostVoteEntity,
    postVote => postVote.post,
  )
  votes!: number;
}
