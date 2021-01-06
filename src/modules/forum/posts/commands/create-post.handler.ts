import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from './create-post.command';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity, UserEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { PostMapper } from '../mappers';
import { Result } from '../../../../shared/core';
import { Post } from '../../../../domain/forum-aggregate';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectRepository(PostEntity) private readonly _postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _postMapper: PostMapper,
    private readonly _publisher: EventPublisher,
  ) {}

  async execute(command: CreatePostCommand): Promise<Result<void>> {
    const user = await this._userRepository.findOne({ id: command.userId });
    if (!user) {
      return Result.fail<void>(`User with id: ${command.userId} not found`);
    }

    const post = this._publisher.mergeObjectContext(
      Post.create(command.userId, command.title, command.type, 0, 0, new Date(), []),
    );

    const postEntity = await this._postMapper.domainToEntity(post);

    try {
      await this._postRepository.save(postEntity);
      post.commit();
    } catch (err) {
      // TODO: turn into Result.fail
    }

    return Result.ok<void>();
  }
}
