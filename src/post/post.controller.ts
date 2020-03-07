import { Controller, Get, Param, Body, Post, Put, Delete, UsePipes, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { PostBody, PostsBody } from './interfaces/post.interface';
import { FilterDto, CreatePostDto, UpdatePostDto, VotePostDto } from './dto';
import { createSchema, updateSchema, filterSchema } from './validator';
import { voteSchema } from './validator/vote-post.validator';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/all')
  async findMany(@Body(new JoiValidationPipe(filterSchema)) filter: FilterDto): Promise<PostsBody> {
    return this.postService.findMany(filter);
  }

  @Post('/news-feed')
  @UseGuards(AuthGuard)
  async newsFeed(
    @Body(new JoiValidationPipe(filterSchema)) filter: FilterDto,
    @User() user: JwtPayload,
  ): Promise<PostsBody> {
    return this.postService.newsFeed(user.id, filter);
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() createPostDto: CreatePostDto, @User() user: JwtPayload) {
    return this.postService.create(user.id, createPostDto);
  }

  @Get('/:postId')
  async findOne(@Param('postId') postId: number): Promise<PostBody> {
    return this.postService.findOne(postId);
  }

  @Put('/:postId/update')
  async update(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(updateSchema)) updatePostDto: UpdatePostDto,
    @User() user: JwtPayload,
  ) {
    return this.postService.update(user.id, postId, updatePostDto);
  }

  @Delete('/:postId/delete')
  async delete(@Param('postId') postId: number, @User() user: JwtPayload): Promise<{ message: string }> {
    return this.postService.delete(user.id, postId);
  }

  @Post('/:postId/vote')
  async vote(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(voteSchema)) votePostDto: VotePostDto,
    @User() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.postService.vote(user.id, postId, votePostDto);
  }
}
