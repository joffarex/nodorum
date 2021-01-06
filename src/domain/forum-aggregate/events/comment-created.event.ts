import { DomainEvent } from '../../seed-work';
import { Comment } from '../comment';
import { Post } from '../post';

export class CommentCreatedEvent extends DomainEvent {
  constructor(public readonly comment: Comment, public readonly post: Post) {
    super(new Date());
  }
}
