export class UpvoteCommentCommand {
  constructor(public readonly userId: string, public readonly commentId: string) {}
}
