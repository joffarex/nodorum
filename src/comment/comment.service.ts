import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentBody, CommentsBody } from './interfaces/comment.interface';
import { FilterDto } from 'src/post/dto';
import { CreateCommentDto, UpdateCommentDto, VoteCommentDto } from './dto';
import { CommentVoteEntity } from './comment-vote.entity';

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
      throw new NotFoundException();
    }

    return { comment };
  }

  async getCommentTree(postId: number, parentId: number | null, filter: FilterDto): Promise<CommentsBody> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['comments'] });

    if (!post) {
      throw new NotFoundException();
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

    // if username is specified, get user's comments
    if ('username' in filter) {
      const user = await this.userRepository.findOne({ username: filter.username });

      if (!user) {
        throw new NotFoundException();
      }

      qb.andWhere('"comment"."userId" = :userId', { userId: user.id });
    }

    qb.orderBy('comment.createdAt', 'DESC');

    const commentsCount = await qb.getCount();

    // for pagination
    if ('limit' in filter) {
      qb.limit(filter.limit);
    }

    if ('offset' in filter) {
      qb.offset(filter.offset);
    }

    const comments = await qb.getMany();

    // If comments exist, then check if it's replies exist as well
    if (commentsCount > 0) {
      for (const comment of comments) {
        const postVotes = await this.commentVoteRepository
          .createQueryBuilder('comment_vote')
          .select('SUM(comment_vote.direction)', 'sum')
          .where('"comment_vote"."commentId" = :commentId', { commentId: comment.id })
          .getRawOne();

        comment.votes = Number(postVotes.sum) || 0;

        // Call the same function recursively in order to fetch replies
        const replies = await this.getCommentTree(postId, comment.id, filter);
        // Attach replies to comment object
        if (replies.commentsCount > 0) (comment as any).replies = replies.comments;
      }
    }

    return {
      comments,
      commentsCount,
    };
  }

  async create(userId: number, postId: number, createCommentDto: CreateCommentDto): Promise<CommentBody> {
    const { text, parentId } = createCommentDto;

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['comments'] });

    if (!user) {
      throw new NotFoundException();
    }

    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['comments'] });

    if (!post) {
      throw new NotFoundException();
    }

    const comment = new CommentEntity();
    comment.text = text;
    comment.parentId = parentId;

    const newComment = await this.commentRepository.save(comment);

    user.comments.push(comment);
    post.comments.push(comment);

    await this.userRepository.save(user);
    await this.postRepository.save(post);

    return { comment: newComment };
  }

  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentBody> {
    const { text } = updateCommentDto;

    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['comments'] });

    if (!post) {
      throw new NotFoundException();
    }

    const comment = await this.isCommentValid(userId, commentId);

    if (text) comment.text = text;

    const updatedComment = await this.commentRepository.save(comment);

    return { comment: updatedComment };
  }

  async delete(userId: number, postId: number, commentId: number): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['comments'] });

    if (!post) {
      throw new NotFoundException();
    }

    const comment = await this.isCommentValid(userId, commentId);

    const { affected } = await this.commentRepository.delete(comment.id);

    if (affected !== 1) {
      throw new InternalServerErrorException();
    }

    // remove deleted comment's replies
    await this.removeReplies(comment.id);

    return { message: 'Comment successfully removed.' };
  }

  async vote(userId: number, commentId: number, voteCommentDto: VoteCommentDto): Promise<{ message: string }> {
    const { direction } = voteCommentDto;

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const comment = await this.commentRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException();
    }

    const commentVote = await this.commentVoteRepository
      .createQueryBuilder('comment_vote')
      .where('"comment_vote"."commentId" = :commentId', { commentId })
      .andWhere('"comment_vote"."userId" = :userId', { userId: user.id })
      .getOne();

    if (commentVote?.direction === direction) {
      // if vote is the same, set direction to 0
      commentVote.direction = 0;
      await this.commentVoteRepository.save(commentVote);
    } else if (commentVote?.direction || commentVote?.direction === 0) {
      // If vote exists or is 0, set direction to whatever input is
      commentVote.direction = direction;
      await this.commentVoteRepository.save(commentVote);
    } else {
      // If vote does not exist, create it
      const newCommentVote = new CommentVoteEntity();
      newCommentVote.direction = direction;
      newCommentVote.user = user;
      newCommentVote.comment = comment;
      await this.commentVoteRepository.save(newCommentVote);
    }

    return { message: 'Comment voted successfully.' };
  }

  private async isCommentValid(userId: number, commentId: number): Promise<CommentEntity> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.id = :id', { id: commentId })
      .getOne();

    if (!comment) {
      throw new NotFoundException();
    }

    if (comment.user.id !== userId) {
      throw new UnauthorizedException();
    }

    return comment;
  }

  private async removeReplies(id: number): Promise<void> {
    const replies = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('"comment"."parentId" = :id', { id })
      .getMany();

    for (const reply of replies) {
      // Call the same function recursively in order to remove all the replies
      await this.removeReplies(reply.id);

      const { affected } = await this.commentRepository.delete({ id: reply.id });

      if (affected !== 1) {
        throw new InternalServerErrorException();
      }
    }
  }
}
