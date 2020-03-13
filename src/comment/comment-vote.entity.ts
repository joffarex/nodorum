import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { ExtendedEntity } from 'src/shared';
import { UserEntity } from 'src/user/user.entity';

@Entity({ name: 'commentvotes' })
@Index(['commentId', 'userId'])
@Index(['commentId', 'direction'])
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
