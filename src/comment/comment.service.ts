import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageResponse } from '../shared';
import { CreateCommentDto, UpdateCommentDto, VoteCommentDto, FilterDto } from './dto';
import { CommentBody, CommentsBody } from './interfaces/comment.interface';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { PostEntity } from '../post/post.entity';
import { CommentVoteEntity } from './comment-vote.entity';
import { DateTime } from 'luxon';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentVoteEntity) private readonly commentVoteRepository: Repository<CommentVoteEntity>,
  ) {}

  async findOne(id: number): Promise<CommentBody> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return { comment };
  }

  async getCommentTree(postId: number, parentId: number | null, filter: FilterDto): Promise<CommentsBody> {
    const post = await this.postRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('"comment"."postId" = :postId', { postId: post.id });

    if (parentId === null) {
      qb.andWhere('"comment"."parentId" IS NULL');
    } else {
      qb.andWhere('"comment"."parentId" = :parentId', { parentId });
    }

    qb.orderBy('comment.createdAt', 'DESC');

    const commentsCount = await qb.getCount();

    const comments = await this.sortComments(qb, filter);

    // If comments exist, then check if it's replies exist as well
    if (commentsCount > 0) {
      for (const comment of comments) {
        // Call the same function recursively in order to fetch replies
        const replies = await this.getCommentTree(postId, comment.id, filter);
        // Attach replies to comment object
        if (replies.commentsCount > 0) (comment as any).replies = replies.comments;
      }
    }

    return { comments, commentsCount };
  }

  async getUserComments(userId: number, filter: FilterDto): Promise<CommentsBody> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('"comment"."userId" = :userId', { userId: user.id });

    const commentsCount = await qb.getCount();

    const comments = await this.sortComments(qb, filter);

    return { comments, commentsCount };
  }

  async create(userId: number, postId: number, createCommentDto: CreateCommentDto): Promise<CommentBody> {
    const { text, parentId } = createCommentDto;

    const { user, post } = await this.areUserAndPostValid(userId, postId);

    const comment = new CommentEntity();
    comment.text = text;
    comment.parentId = parentId;
    comment.post = post;
    comment.user = user;

    const newComment = await this.commentRepository.save(comment);

    return { comment: newComment };
  }

  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentBody> {
    const { text } = updateCommentDto;

    const { user } = await this.areUserAndPostValid(userId, postId);

    const comment = await this.isCommentValid(user.id, commentId);

    if (text) comment.text = text;

    const updatedComment = await this.commentRepository.save(comment);

    return { comment: updatedComment };
  }

  async delete(userId: number, postId: number, commentId: number): Promise<MessageResponse> {
    const { user } = await this.areUserAndPostValid(userId, postId);

    const comment = await this.isCommentValid(user.id, commentId);

    comment.deletedAt = DateTime.local();

    await this.commentRepository.save(comment);

    return { message: 'Comment successfully removed' };
  }

  async vote(userId: number, commentId: number, voteCommentDto: VoteCommentDto): Promise<MessageResponse> {
    const { direction } = voteCommentDto;

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = await this.commentRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const commentVote = await this.commentVoteRepository
      .createQueryBuilder('commentvotes')
      .where('"commentvotes"."commentId" = :commentId', { commentId })
      .andWhere('"commentvotes"."userId" = :userId', { userId: user.id })
      .getOne();

    let responseMessage: string;
    const type = direction === 1 ? 'up' : direction === -1 ? 'down' : '';

    if (commentVote && commentVote.direction === direction) {
      // if vote is the same, set direction to 0
      commentVote.direction = 0;
      await this.commentVoteRepository.save(commentVote);
      responseMessage = 'Comment vote reset';
    } else if ((commentVote && commentVote.direction) || (commentVote && commentVote.direction === 0)) {
      // If vote exists or is 0, set direction to whatever input is
      commentVote.direction = direction;
      await this.commentVoteRepository.save(commentVote);

      responseMessage = `Comment ${type}voted`;
    } else {
      // If vote does not exist, create it
      const newCommentVote = new CommentVoteEntity();
      newCommentVote.direction = direction;
      newCommentVote.user = user;
      await this.commentVoteRepository.save(newCommentVote);

      responseMessage = `Comment ${type}voted successfully`;
    }

    return { message: responseMessage };
  }

  private async sortComments(qb: SelectQueryBuilder<CommentEntity>, filter: FilterDto): Promise<CommentEntity[]> {
    qb.orderBy('comments.createdAt', 'DESC');

    // for pagination
    if ('limit' in filter) {
      qb.limit(filter.limit);
    }

    if ('offset' in filter) {
      qb.offset(filter.offset);
    }

    const comments = await qb.getMany();

    for (const comment of comments) {
      const commentVotes = await this.commentVoteRepository
        .createQueryBuilder('commentvotes')
        .select('SUM(commentvotes.direction)', 'sum')
        .where('"commentvotes"."commentId" = :commentId', { commentId: comment.id })
        .getRawOne();
      comment.votes = Number(commentVotes.sum) || 0;
    }

    if ('byVotes' in filter) {
      if (filter.byVotes === 'DESC') {
        comments.sort((a: CommentEntity, b: CommentEntity) => b.votes - a.votes);
      }

      if (filter.byVotes === 'ASC') {
        comments.sort((a: CommentEntity, b: CommentEntity) => a.votes - b.votes);
      }
    }

    return comments;
  }

  private async isCommentValid(userId: number, commentId: number): Promise<CommentEntity> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.id = :id', { id: commentId })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new UnauthorizedException();
    }

    return comment;
  }

  private async areUserAndPostValid(userId: number, postId: number): Promise<{ user: UserEntity; post: PostEntity }> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.postRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return { user, post };
  }
}
