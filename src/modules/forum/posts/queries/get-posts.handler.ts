import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQuery } from './get-posts.query';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { Result } from '../../../../shared/core';
import { Post } from '../../../../domain/forum-aggregate';
import { PostMapper } from '../mappers';

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery> {
  constructor(
    @InjectRepository(PostEntity) private readonly _postRepository: Repository<PostEntity>,
    private readonly _postMapper: PostMapper,
  ) {}

  async execute(query: GetPostsQuery): Promise<Result<Post[]>> {
    // TODO: implement query
    const foundPosts = await this._postRepository.find({});
    const postPromises = foundPosts.map((post) => this._postMapper.entityToDomain(post));
    const posts = await Promise.all(postPromises);
    return Result.ok(posts);
  }
}
