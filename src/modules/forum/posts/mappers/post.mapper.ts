import { IMapper } from '../../../../shared/core';
import { PostEntity } from '../../../../shared/infrastructure/entities';
import { Post, PostType, PostVote } from '../../../../domain/forum-aggregate';

export class PostMapper implements IMapper<PostEntity, Post> {
  async domainToEntity(domain: Post): Promise<PostEntity> {
    const postEntity = new PostEntity();
    postEntity.id = domain.postId;
    postEntity.user.id = domain.userId;
    postEntity.type = domain.type;
    postEntity.title = domain.title;
    postEntity.text = domain.text;
    postEntity.link = domain.link;
    postEntity.points = domain.points;
    postEntity.totalComments = domain.totalComments;

    return postEntity;
  }

  async entityToDomain(entity: PostEntity): Promise<Post> {
    const votes = entity.votes.map((vote) => PostVote.createWithId(vote.id, vote.user.id, vote.post.id, vote.type));

    return Post.createWithId(
      entity.id,
      entity.user.id,
      entity.title,
      entity.type,
      entity.totalComments,
      entity.points,
      entity.createdAt,
      votes,
    );
  }
}
