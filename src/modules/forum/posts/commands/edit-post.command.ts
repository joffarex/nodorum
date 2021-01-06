export class EditPostCommand {
  constructor(
    public readonly postId: string,
    public readonly title: string,
    public readonly link: string,
    public readonly text: string,
  ) {}
}
