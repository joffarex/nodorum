import { DomainEvent } from '../../seed-work';
import { Comment } from '../comment';
import { Post } from '../post';
import { CommentVote } from '../comment-vote';

export class CommentVotesChangedEvent extends DomainEvent {
  constructor(public readonly comment: Comment, public readonly commentVote: CommentVote, public readonly post: Post) {
    super(new Date());
  }
}
