import { IMapper } from '../../../../shared/core';
import { CommentEntity } from '../../../../shared/infrastructure/entities';
import { Comment, CommentVote } from '../../../../domain/forum-aggregate';

export class CommentMapper implements IMapper<CommentEntity, Comment> {
  async domainToEntity(domain: Comment): Promise<CommentEntity> {
    const commentEntity = new CommentEntity();
    commentEntity.id = domain.commentId;
    commentEntity.text = domain.text;
    commentEntity.parentCommentId = domain.parentCommentId ? domain.parentCommentId : null;
    commentEntity.post.id = domain.postId;
    commentEntity.user.id = domain.userId;
    commentEntity.points = domain.points;

    return commentEntity;
  }

  async entityToDomain(entity: CommentEntity): Promise<Comment> {
    const votes = entity.votes.map((vote) =>
      CommentVote.createWithId(vote.id, vote.user.id, vote.comment.id, vote.type),
    );

    return Comment.createWithId(
      entity.id,
      entity.post.id,
      entity.user.id,
      votes,
      entity.points,
      entity.parentCommentId,
      entity.text,
    );
  }
}
