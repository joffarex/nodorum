import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { PostEntity } from './post.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'postvotes' })
@Index(['user', 'post'])
@Index(['direction', 'post'])
export class PostVoteEntity extends ExtendedEntity {
  @Column('integer')
  direction!: number;

  @ManyToOne(
    () => UserEntity,
    user => user.posts,
  )
  user!: UserEntity;

  @ManyToOne(
    () => PostEntity,
    post => post.votes,
  )
  post!: PostEntity;
}
