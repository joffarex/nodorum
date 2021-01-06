export class DownvoteCommentCommand {
  constructor(public readonly userId: string, public readonly commentId: string) {}
}
