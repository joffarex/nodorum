import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { ExtendedEntity } from 'src/shared';
import { UserEntity } from 'src/user/user.entity';

@Entity({ name: 'passwordreset' })
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
