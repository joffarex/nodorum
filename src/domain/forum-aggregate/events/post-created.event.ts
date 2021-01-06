import { DomainEvent } from '../../seed-work';
import { Post } from '../post';

export class PostCreatedEvent extends DomainEvent {
  constructor(public readonly post: Post) {
    super(new Date());
  }
}
