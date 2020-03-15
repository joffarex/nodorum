import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { PostVoteEntity } from './post-vote.entity';
import { UserEntity } from '../user/user.entity';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'posts' })
@Index(['user', 'subnoddit'])
export class PostEntity extends ExtendedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  text!: string;

  @Column({
    type: 'varchar',
    length: 700,
    nullable: true,
  })
  attachment!: string;

  @ManyToOne(
    () => UserEntity,
    user => user.posts,
  )
  @Index()
  user!: UserEntity;

  @ManyToOne(
    () => SubnodditEntity,
    subnoddit => subnoddit.posts,
  )
  @Index()
  subnoddit!: SubnodditEntity;

  @OneToMany(
    () => PostVoteEntity,
    postVote => postVote.post,
  )
  votes!: number;

  @OneToMany(
    () => CommentEntity,
    comment => comment.post,
  )
  comments!: CommentEntity[];
}
