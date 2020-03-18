import { Entity, Column, ManyToOne, Index, Unique } from 'typeorm';
import { ExtendedEntity } from '../shared';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'passwordreset' })
@Unique(['user'])
export class PasswordResetEntity extends ExtendedEntity {
  @Column({
    type: 'varchar',
    length: 1000,
    nullable: false,
  })
  token!: string;

  @ManyToOne(
    () => UserEntity,
    user => user.posts,
  )
  @Index()
  user!: UserEntity;

  @Column({ type: 'timestamp' })
  expiredAt!: string;
}
