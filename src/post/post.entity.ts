import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { ExtendedEntity } from 'src/shared';
import { PostVoteEntity } from './post-vote.entity';
import { UserEntity } from 'src/user/user.entity';
import { SubnodditEntity } from 'src/subnoddit/subnoddit.entity';
import { CommentEntity } from 'src/comment/comment.entity';

@Entity({ name: 'posts' })
@Index(['userId', 'subnodditId'])
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
