import { Entity, Column, Index } from 'typeorm';
import { ExtendedEntity } from 'src/shared';

@Entity({ name: 'followers' })
@Index(['userId', 'followerId'])
export class FollowerEntity extends ExtendedEntity {
  @Column('integer')
  @Index()
  userId!: number;

  @Column('integer')
  @Index()
  followerId!: number;
}
