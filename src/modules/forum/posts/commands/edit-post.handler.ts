import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { EditPostCommand } from './edit-post.command';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity, UserEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { PostMapper } from '../mappers';
import { Result } from '../../../../shared/core';

@CommandHandler(EditPostCommand)
export class EditPostHandler implements ICommandHandler<EditPostCommand> {
  constructor(
    @InjectRepository(PostEntity) private readonly _postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _postMapper: PostMapper,
    private readonly _publisher: EventPublisher,
  ) {}

  async execute(command: EditPostCommand): Promise<any> {
    const foundPost = await this._postRepository.findOne({ id: command.postId });
    if (!foundPost) {
      return Result.fail<void>(`Post with id: ${command.postId} not found`);
    }

    foundPost.title = command.title;
    foundPost.text = command.text;
    foundPost.link = command.link;

    try {
      await this._postRepository.save(foundPost);
    } catch (err) {
      // TODO: turn into Result.fail
    }

    return Result.ok<void>();
  }
}
