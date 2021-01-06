import { GetCommentByIdHandler } from './get-comment-by-id.handler';
import { GetCommentsByPostIdHandler } from './get-comments-by-post-id.handler';

export * from './get-comment-by-id.query';
export * from './get-comments-by-post-id.query';

export const QueryHandlers = [GetCommentByIdHandler, GetCommentsByPostIdHandler];
