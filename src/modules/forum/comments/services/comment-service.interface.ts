import { Comment, CommentVote } from '../../../../domain/forum-aggregate';
import { User } from '../../../../domain/user-aggregate';
import { Result } from '../../../../shared/core';

export const COMMENT_SERVICE = 'COMMENT_SERVICE';

export interface ICommentService {
  downvoteComment(comment: Comment, user: User, existingVotes: CommentVote[]): Promise<Result<void>>;

  upvoteComment(comment: Comment, user: User, existingVotes: CommentVote[]): Promise<Result<void>>;
}
