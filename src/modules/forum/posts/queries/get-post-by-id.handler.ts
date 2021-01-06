import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostByIdQuery } from './get-post-by-id.query';
import { Result } from '../../../../shared/core';
import { Post } from '../../../../domain/forum-aggregate';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { PostMapper } from '../mappers';

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(
    @InjectRepository(PostEntity) private readonly _postRepository: Repository<PostEntity>,
    private readonly _postMapper: PostMapper,
  ) {}

  async execute(query: GetPostByIdQuery): Promise<Result<Post> | Result<string>> {
    const foundPost = await this._postRepository.findOne({ id: query.id });
    if (!foundPost) {
      return Result.fail<string>(`Post with id: ${query.id} not found`);
    }

    const post = await this._postMapper.entityToDomain(foundPost);
    return Result.ok(post);
  }
}
