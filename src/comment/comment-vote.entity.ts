import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'commentvotes' })
@Index(['comment', 'user'])
@Index(['comment', 'direction'])
export class CommentVoteEntity extends ExtendedEntity {
  @Column('integer')
  direction!: number;

  @ManyToOne(
    () => UserEntity,
    user => user.posts,
  )
  user!: UserEntity;

  @ManyToOne(
    () => CommentEntity,
    comment => comment.votes,
  )
  comment!: CommentEntity;
}
