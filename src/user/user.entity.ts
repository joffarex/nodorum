import { DateTime } from 'luxon';
import { Entity, Column, OneToMany, Index, Unique } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { PostEntity } from '../post/post.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'users' })
@Index(['id', 'deletedAt'])
@Unique(['username', 'email'])
export class UserEntity extends ExtendedEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  @Index()
  username!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  @Index()
  email!: string;

  @Column({
    type: 'varchar',
    length: 700,
    select: false,
  })
  password!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName!: string;

  @Column({
    type: 'varchar',
    length: 700,
    nullable: true,
    default: 'pictures/blank-profile-picture-S4P3RS3CR3T',
  })
  profileImage!: string;

  @Column({
    type: 'varchar',
    length: 700,
    nullable: true,
  })
  bio!: string;

  @Column({ type: 'timestamp', nullable: true, select: false })
  verifiedAt!: DateTime;

  @OneToMany(
    () => SubnodditEntity,
    subnoddit => subnoddit.user,
  )
  subnoddits!: SubnodditEntity[];

  @OneToMany(
    () => PostEntity,
    post => post.user,
  )
  posts!: PostEntity[];

  @OneToMany(
    () => CommentEntity,
    comment => comment.user,
  )
  comments!: CommentEntity[];

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: DateTime;
}
