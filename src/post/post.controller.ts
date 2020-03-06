import { Controller, Get, Param, Body, Post, Put, Delete, UsePipes, Scope, Inject, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { PostBody, PostsBody } from './interfaces/post.interface';
import { FilterDto, CreatePostDto, UpdatePostDto, VotePostDto } from './dto';
import { createSchema, updateSchema, filterSchema } from './validator';
import { voteSchema } from './validator/vote-post.validator';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller({
  path: 'post',
  scope: Scope.REQUEST,
})
export class PostController {
  constructor(@Inject(REQUEST) private readonly request: FastifyRequest, private readonly postService: PostService) {}

  @Post('/')
  async findMany(@Body(new JoiValidationPipe(filterSchema)) filter: FilterDto): Promise<PostsBody> {
    return this.postService.findMany(filter);
  }

  @Get('/:postId')
  async findOne(@Param('postId') postId: number): Promise<PostBody> {
    return this.postService.findOne(postId);
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(this.request.user.id, createPostDto);
  }

  @Put('/:postId/update')
  @UseGuards(AuthGuard)
  async update(@Param('postId') postId: number, @Body(new JoiValidationPipe(updateSchema)) updatePostDto: UpdatePostDto) {
    return this.postService.update(this.request.user.id, postId, updatePostDto);
  }

  @Delete('/:postId/delete')
  @UseGuards(AuthGuard)
  async delete(@Param('postId') postId: number): Promise<{ message: string }> {
    return this.postService.delete(this.request.user.id, postId);
  }

  @Post('/:postId/vote')
  @UseGuards(AuthGuard)
  async vote(
    @Param('postId') postId: number,
    @Body(new JoiValidationPipe(voteSchema)) votePostDto: VotePostDto,
  ): Promise<{ message: string }> {
    return this.postService.vote(this.request.user.id, postId, votePostDto);
  }
}
