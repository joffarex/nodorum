import { Controller, Param, Body, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentsBody } from './interfaces/comment.interface';
import { FilterDto, CreateCommentDto, UpdateCommentDto, VoteCommentDto } from './dto';
import { createSchema, updateSchema, voteSchema, filterSchema } from './validator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { User } from 'src/shared/decorators';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:postId')
  async getCommentTree(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(filterSchema)) filter: FilterDto,
  ): Promise<CommentsBody> {
    return this.commentService.getCommentTree(postId, null, filter);
  }

  @Post(':postId/create')
  @UseGuards(AuthGuard)
  async create(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(createSchema)) createCommentDto: CreateCommentDto,
    @User() user: JwtPayload,
  ) {
    return this.commentService.create(user.id, postId, createCommentDto);
  }

  @Post('/:commentId/vote')
  @UseGuards(AuthGuard)
  async vote(
    @Param('commentId') commentId: number,
    @Body(new JoiValidationPipe(voteSchema)) voteCommentDto: VoteCommentDto,
    @User() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.commentService.vote(user.id, commentId, voteCommentDto);
  }

  @Put('/:postId/:commentId/update')
  @UseGuards(AuthGuard)
  async update(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body(new JoiValidationPipe(updateSchema)) updateCommentDto: UpdateCommentDto,
    @User() user: JwtPayload,
  ) {
    return this.commentService.update(user.id, postId, commentId, updateCommentDto);
  }

  @Delete('/:postId/:commentId/delete')
  @UseGuards(AuthGuard)
  async delete(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @User() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.commentService.delete(user.id, postId, commentId);
  }
}
