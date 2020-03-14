import { Controller, Param, Body, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { User, Rcid } from 'src/shared/decorators';
import { JoiValidationPipe } from 'src/shared/pipes';
import { AuthGuard } from 'src/shared/guards';
import { logFormat, MessageResponse } from 'src/shared';
import { AppLogger } from 'src/app.logger';
import { createSchema, updateSchema, voteSchema, filterSchema } from './validator';
import { FilterDto, CreateCommentDto, UpdateCommentDto, VoteCommentDto } from './dto';
import { CommentsBody, CommentBody } from './interfaces/comment.interface';
import { CommentService } from './comment.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('comment')
export class CommentController {
  private logger = new AppLogger('CommentController');

  constructor(private readonly commentService: CommentService) {}

  @Post('/:postId')
  async getCommentTree(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(filterSchema)) filter: FilterDto,
    @Rcid() rcid: string,
  ): Promise<CommentsBody> {
    const commentsBody = await this.commentService.getCommentTree(postId, null, filter);
    this.logger.debug(logFormat(rcid, 'getCommentTree', 'found all comments', filter, null));

    return commentsBody;
  }

  @Post(':postId/create')
  @UseGuards(AuthGuard)
  async create(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(createSchema)) createCommentDto: CreateCommentDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<CommentBody> {
    const commentBody = await this.commentService.create(user.id, postId, createCommentDto);
    this.logger.debug(
      logFormat(rcid, 'create', `comment with id: ${commentBody.comment.id} created`, createCommentDto, user),
    );

    return commentBody;
  }

  @Post('/:commentId/vote')
  @UseGuards(AuthGuard)
  async vote(
    @Param('commentId') commentId: number,
    @Body(new JoiValidationPipe(voteSchema)) voteCommentDto: VoteCommentDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.commentService.vote(user.id, commentId, voteCommentDto);
    this.logger.debug(logFormat(rcid, 'vote', `${res} (commentId: ${commentId})`, {}, user));

    return res;
  }

  @Put('/:postId/:commentId/update')
  @UseGuards(AuthGuard)
  async update(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body(new JoiValidationPipe(updateSchema)) updateCommentDto: UpdateCommentDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<CommentBody> {
    const commentBody = await this.commentService.update(user.id, postId, commentId, updateCommentDto);
    this.logger.debug(
      logFormat(rcid, 'update', `comment with id: ${commentBody.comment.id} updated`, updateCommentDto, user),
    );

    return commentBody;
  }

  @Delete('/:postId/:commentId/delete')
  @UseGuards(AuthGuard)
  async delete(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.commentService.delete(user.id, postId, commentId);
    this.logger.debug(logFormat(rcid, 'remove', `comment with id: ${commentId} removed`, {}, user));

    return res;
  }
}
