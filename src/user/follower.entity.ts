import { Entity, Column } from 'typeorm';
import { ExtendedEntity } from '../shared';

@Entity({ name: 'followers' })
export class FollowerEntity extends ExtendedEntity {
  @Column('integer')
  userId!: number;

  @Column('integer')
  followerId!: number;
}
