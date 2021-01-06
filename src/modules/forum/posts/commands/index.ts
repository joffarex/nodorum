import { CreatePostHandler } from './create-post.handler';
import { EditPostHandler } from './edit-post.handler';
import { DownvotePostHandler } from './downvote-post.handler';
import { UpvotePostHandler } from './upvote-post.handler';

export * from './create-post.command';
export * from './edit-post.command';
export * from './downvote-post.command';
export * from './upvote-post.command';

export const CommandHandlers = [CreatePostHandler, EditPostHandler, DownvotePostHandler, UpvotePostHandler];
