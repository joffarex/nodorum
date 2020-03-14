import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { PostBody, PostsBody } from './interfaces/post.interface';
import { FilterDto, CreatePostDto, UpdatePostDto, VotePostDto } from './dto';
import { createSchema, updateSchema, filterSchema } from './validator';
import { voteSchema } from './validator/vote-post.validator';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/app.logger';
import { logFormat, MessageResponse } from 'src/shared';
import { Rcid } from 'src/shared/decorators/rcid.decorator';

@Controller('post')
export class PostController {
  private logger = new AppLogger('PostController');

  constructor(private readonly postService: PostService) {}

  @Post('/all')
  async findMany(
    @Body(new JoiValidationPipe(filterSchema)) filter: FilterDto,
    @Rcid() rcid: string,
  ): Promise<PostsBody> {
    const postsBody = await this.postService.findMany(filter);
    this.logger.debug(logFormat(rcid, 'findMany', 'found all posts', filter, null));

    return postsBody;
  }

  @Post('/news-feed')
  @UseGuards(AuthGuard)
  async newsFeed(
    @Body(new JoiValidationPipe(filterSchema)) filter: FilterDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<PostsBody> {
    const postsBody = await this.postService.newsFeed(user.id, filter);
    this.logger.debug(logFormat(rcid, 'newsFeed', 'found all news feed posts', filter, user));

    return postsBody;
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  async create(
    @Body(new JoiValidationPipe(createSchema)) createPostDto: CreatePostDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<PostBody> {
    const postBody = await this.postService.create(user.id, createPostDto);
    this.logger.debug(logFormat(rcid, 'create', `post with id: ${postBody.post.id} created`, createPostDto, user));

    return postBody;
  }

  @Get('/:postId')
  async findOne(@Param('postId') postId: number, @Rcid() rcid: string): Promise<PostBody> {
    const postBody = await this.postService.findOne(postId);
    this.logger.debug(logFormat(rcid, 'findOne', `post with id: ${postBody.post.id} found`, {}, null));

    return postBody;
  }

  @Put('/:postId/update')
  async update(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(updateSchema)) updatePostDto: UpdatePostDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<PostBody> {
    const postBody = await this.postService.update(user.id, postId, updatePostDto);
    this.logger.debug(logFormat(rcid, 'update', `post with id: ${postBody.post.id} updated`, updatePostDto, user));

    return postBody;
  }

  @Delete('/:postId/delete')
  async delete(
    @Param('postId') postId: number,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.postService.delete(user.id, postId);
    this.logger.debug(logFormat(rcid, 'delete', `post with id: ${postId} removed`, {}, user));

    return res;
  }

  @Post('/:postId/vote')
  async vote(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(voteSchema)) votePostDto: VotePostDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.postService.vote(user.id, postId, votePostDto);
    this.logger.debug(logFormat(rcid, 'vote', `${res} (postId: ${postId})`, {}, user));

    return res;
  }
}
