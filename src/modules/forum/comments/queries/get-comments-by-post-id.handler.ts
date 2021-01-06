import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsByPostIdQuery } from './get-comments-by-post-id.query';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { CommentMapper } from '../mappers';
import { Result } from '../../../../shared/core';
import { Comment } from '../../../../domain/forum-aggregate';

@QueryHandler(GetCommentsByPostIdQuery)
export class GetCommentsByPostIdHandler implements IQueryHandler<GetCommentsByPostIdQuery> {
  constructor(
    @InjectRepository(CommentEntity) private readonly _commentRepository: Repository<CommentEntity>,
    private readonly _commentMapper: CommentMapper,
  ) {}

  async execute(query: GetCommentsByPostIdQuery): Promise<Result<Comment[]>> {
    const foundComments = await this._commentRepository.find({ skip: query.offset });
    const commentPromises = foundComments.map((comment) => this._commentMapper.entityToDomain(comment));
    const comments = await Promise.all(commentPromises);

    return Result.ok(comments);
  }
}
