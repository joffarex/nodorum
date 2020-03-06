import { Entity, Column, OneToMany } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { SubnodditEntity } from 'src/subnoddit/subnoddit.entity';
import { PostEntity } from 'src/post/post.entity';
// import { Comment } from 'src/comment/comment.entity';
// import { Category } from 'src/category/category.entity';

export type UserStatus = 'VERIFIED' | 'NOT_VERIFIED';

@Entity({ name: 'users' })
export class UserEntity extends ExtendedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
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

  // @OneToMany(
  //   type => Comment,
  //   comment => comment.user,
  // )
  // comments!: Comment[];

  // @OneToMany(
  //   type => Category,
  //   category => category.user,
  // )
  // categories!: Category[];
}
