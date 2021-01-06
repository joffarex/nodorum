import { GetPostByIdHandler } from './get-post-by-id.handler';
import { GetPostsHandler } from './get-posts.handler';

export * from './get-post-by-id.query';
export * from './get-posts.query';

export const QueryHandlers = [GetPostByIdHandler, GetPostsHandler];
