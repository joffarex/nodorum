import { Post, PostVote } from '../../../../domain/forum-aggregate';
import { User } from '../../../../domain/user-aggregate';
import { Result } from '../../../../shared/core';

export const POST_SERVICE = 'POST_SERVICE';

export interface IPostService {
  downvotePost(post: Post, user: User, existingVotes: PostVote[]): Promise<Result<void>>;

  upvotePost(post: Post, user: User, existingVotes: PostVote[]): Promise<Result<void>>;
}
