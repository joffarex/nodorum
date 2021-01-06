import { DomainEvent } from '../../seed-work';
import { Post } from '../post';
import { PostVote } from '../post-vote';

export class PostVotesChangedEvent extends DomainEvent {
  constructor(public readonly post: Post, public readonly postVote: PostVote) {
    super(new Date());
  }
}
