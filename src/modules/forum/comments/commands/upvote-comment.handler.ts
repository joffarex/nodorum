import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpvoteCommentCommand } from './upvote-comment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity, CommentVoteEntity, UserEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { Result } from '../../../../shared/core';
import { ICommentService, COMMENT_SERVICE } from '../services';
import { Inject } from '@nestjs/common';
import { CommentMapper } from '../mappers';
import { UserMapper } from '../../../users/mappers';
import { CommentVote } from '../../../../domain/forum-aggregate';

@CommandHandler(UpvoteCommentCommand)
export class UpvoteCommentHandler implements ICommandHandler<UpvoteCommentCommand> {
  constructor(
    @InjectRepository(CommentEntity) private readonly _commentRepository: Repository<CommentEntity>,
    @InjectRepository(CommentVoteEntity) private readonly _commentVoteRepository: Repository<CommentVoteEntity>,
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _publisher: EventPublisher,
    private readonly _commentMapper: CommentMapper,
    private readonly _userMapper: UserMapper,
    @Inject(COMMENT_SERVICE) private readonly _commentService: ICommentService,
  ) {}

  async execute(command: UpvoteCommentCommand): Promise<Result<void>> {
    const foundUser = await this._userRepository.findOne({ id: command.userId });
    if (!foundUser) {
      return Result.fail<void>(`User with id: ${command.userId} not found`);
    }

    const foundComment = await this._commentRepository.findOne({ id: command.commentId });
    if (!foundComment) {
      return Result.fail<void>(`Comment with id: ${command.commentId} not found`);
    }

    const existingVote = await this._commentVoteRepository
      .createQueryBuilder('commentVotes')
      .where('commentVotes.userId = :userId', { userId: command.userId })
      .andWhere('commentVotes.commentId = :commentId', { commentId: command.commentId })
      .getMany();

    const votes = existingVote.map((vote) =>
      CommentVote.createWithId(vote.id, vote.user.id, vote.comment.id, vote.type),
    );

    const comment = await this._commentMapper.entityToDomain(foundComment);

    const user = await this._userMapper.entityToDomain(foundUser);

    return await this._commentService.upvoteComment(comment, user, votes);
  }
}
