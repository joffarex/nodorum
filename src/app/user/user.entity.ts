import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ExtendedEntity } from '../shared';
// import { Post } from 'src/post/post.entity';
// import { Comment } from 'src/comment/comment.entity';
// import { Category } from 'src/category/category.entity';

export type UserStatus = 'VERIFIED' | 'NOT_VERIFIED';

@Entity({name: 'users'})
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

  // @OneToMany(
  //   type => Post,
  //   post => post.user,
  // )
  // posts!: Post[];

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
