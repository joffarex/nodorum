export class GetCommentsByPostIdQuery {
  constructor(public readonly postId: string, public readonly offset: number = 0) {}
}
