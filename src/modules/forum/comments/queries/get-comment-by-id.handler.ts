import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentByIdQuery } from './get-comment-by-id.query';
import { Result } from '../../../../shared/core';
import { Comment } from '../../../../domain/forum-aggregate';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { CommentMapper } from '../mappers';

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    @InjectRepository(CommentEntity) private readonly _commentRepository: Repository<CommentEntity>,
    private readonly _commentMapper: CommentMapper,
  ) {}

  async execute(query: GetCommentByIdQuery): Promise<Result<Comment> | Result<string>> {
    const foundComment = await this._commentRepository.findOne({ id: query.id });
    if (!foundComment) {
      return Result.fail<string>(`Comment with id: ${query.id} not found`);
    }

    const post = await this._commentMapper.entityToDomain(foundComment);
    return Result.ok(post);
  }
}
