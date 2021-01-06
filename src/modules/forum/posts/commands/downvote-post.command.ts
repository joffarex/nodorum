export class DownvotePostCommand {
  constructor(public readonly userId: string, public readonly postId: string) {}
}
