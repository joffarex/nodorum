import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { UserEntity } from 'src/user/user.entity';
import { SubnodditEntity } from 'src/subnoddit/subnoddit.entity';
import { CommentEntity } from 'src/comment/comment.entity';
import { PostVoteEntity } from './post-vote.entity';

@Entity({ name: 'posts' })
export class PostEntity extends ExtendedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  title!: string;

  @Column('text')
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
  user!: UserEntity;

  @ManyToOne(
    () => SubnodditEntity,
    subnoddit => subnoddit.posts,
  )
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
