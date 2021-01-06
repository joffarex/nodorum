export class UpvotePostCommand {
  constructor(public readonly userId: string, public readonly postId: string) {}
}
