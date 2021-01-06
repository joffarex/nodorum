import { PostType } from '../../../../domain/forum-aggregate';

export class CreatePostCommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly text: string,
    public readonly link: string,
    public readonly type: PostType,
  ) {}
}
