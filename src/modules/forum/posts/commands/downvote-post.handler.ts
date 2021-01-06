import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DownvotePostCommand } from './downvote-post.command';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity, PostVoteEntity, UserEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { Result } from '../../../../shared/core';
import { IPostService, POST_SERVICE } from '../services';
import { Inject } from '@nestjs/common';
import { PostMapper } from '../mappers';
import { UserMapper } from '../../../users/mappers';
import { PostVote } from '../../../../domain/forum-aggregate';

@CommandHandler(DownvotePostCommand)
export class DownvotePostHandler implements ICommandHandler<DownvotePostCommand> {
  constructor(
    @InjectRepository(PostEntity) private readonly _postRepository: Repository<PostEntity>,
    @InjectRepository(PostVoteEntity) private readonly _postVoteRepository: Repository<PostVoteEntity>,
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _publisher: EventPublisher,
    private readonly _postMapper: PostMapper,
    private readonly _userMapper: UserMapper,
    @Inject(POST_SERVICE) private readonly _postService: IPostService,
  ) {}

  async execute(command: DownvotePostCommand): Promise<Result<void>> {
    const foundUser = await this._userRepository.findOne({ id: command.userId });
    if (!foundUser) {
      return Result.fail<void>(`User with id: ${command.userId} not found`);
    }

    const foundPost = await this._postRepository.findOne({ id: command.postId });
    if (!foundPost) {
      return Result.fail<void>(`Post with id: ${command.postId} not found`);
    }

    const existingVote = await this._postVoteRepository
      .createQueryBuilder('postVotes')
      .where('postVotes.userId = :userId', { userId: command.userId })
      .andWhere('postVotes.postId = :postId', { postId: command.postId })
      .getMany();

    const votes = existingVote.map((vote) => PostVote.createWithId(vote.id, vote.user.id, vote.post.id, vote.type));

    const post = await this._postMapper.entityToDomain(foundPost);

    const user = await this._userMapper.entityToDomain(foundUser);

    return await this._postService.downvotePost(post, user, votes);
  }
}
