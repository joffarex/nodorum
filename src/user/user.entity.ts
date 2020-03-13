import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { SubnodditEntity } from 'src/subnoddit/subnoddit.entity';
import { PostEntity } from 'src/post/post.entity';
import { CommentEntity } from 'src/comment/comment.entity';
import { DateTime } from 'luxon';

export type UserStatus = 'VERIFIED' | 'NOT_VERIFIED';

@Entity({ name: 'users' })
@Index(['id', 'deletedAt'])
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

  @Column({
    type: 'enum',
    enum: ['VERIFIED', 'NOT_VERIFIED'],
    default: 'NOT_VERIFIED',
    select: false,
  })
  status!: UserStatus;

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
