import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageResponse } from '../shared';
import { AppLogger } from '../app.logger';
import { FilterDto, CreatePostDto, UpdatePostDto, VotePostDto } from './dto';
import { PostBody, PostsBody } from './interfaces/post.interface';
import { PostEntity } from './post.entity';
import { PostVoteEntity } from './post-vote.entity';
import { UserEntity } from '../user/user.entity';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { FollowerEntity } from '../user/follower.entity';

@Injectable()
export class PostService {
  private logger = new AppLogger('PostService');

  constructor(
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostVoteEntity) private readonly postVoteRepository: Repository<PostVoteEntity>,
    @InjectRepository(SubnodditEntity) private readonly subnodditRepository: Repository<SubnodditEntity>,
    @InjectRepository(FollowerEntity) private readonly followerRepository: Repository<FollowerEntity>,
  ) {}

  async findOne(id: number): Promise<PostBody> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const postVotes = await this.postVoteRepository
      .createQueryBuilder('postvotes')
      .select('SUM(postvotes.direction)', 'sum')
      .where('"postvotes"."postId" = :postId', { postId: post.id })
      .getRawOne();

    post.votes = Number(postVotes.sum) || 0;

    return { post };
  }

  async findMany(filter: FilterDto): Promise<PostsBody> {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.user', 'user');

    // if there are both username and subnodditId in filter, there is something wrong with front
    if ('username' in filter && 'subnodditId' in filter) {
      throw new InternalServerErrorException();
    }

    // if username is specified, get user's posts
    if ('username' in filter && 'subnodditId' in filter === false) {
      const user = await this.userRepository.findOne({ username: filter.username });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      qb.where('"post"."userId" = :userId', { userId: user.id });
    }

    if ('subnodditId' in filter && 'username' in filter === false) {
      const subnoddit = await this.subnodditRepository.findOne(filter.subnodditId);

      if (!subnoddit) {
        throw new NotFoundException('Subnoddit not found');
      }

      qb.where('"post"."subnodditId" = :subnodditId', { subnodditId: subnoddit.id });
    }

    const postsCount = await qb.getCount();

    const posts = await this.sortPosts(qb, filter);

    return {
      posts,
      postsCount,
    };
  }

  async newsFeed(userId: number, filter: FilterDto): Promise<PostsBody> {
    const followingUsers = await this.followerRepository.find({ followerId: userId });

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.userId IN (:id)', { id: followingUsers.map(fu => fu.userId) });

    if ('subnodditId' in filter) {
      const subnoddit = await this.subnodditRepository.findOne(filter.subnodditId);

      if (!subnoddit) {
        throw new NotFoundException('Subnoddit not found');
      }

      qb.andWhere('"post"."subnodditId" = :subnodditId', { subnodditId: subnoddit.id });
    }

    const postsCount = await qb.getCount();

    const posts = await this.sortPosts(qb, filter);

    return {
      posts,
      postsCount,
    };
  }

  async create(userId: number, createPostDto: CreatePostDto): Promise<PostBody> {
    const { title, text, attachment, subnodditId } = createPostDto;

    const subnoddit = await this.subnodditRepository.findOne(subnodditId);

    if (!subnoddit) {
      throw new NotFoundException('Subnoddit not found');
    }

    const post = new PostEntity();
    post.title = title;
    if (text) post.text = text;
    post.subnoddit = subnoddit;
    if (attachment) post.attachment = attachment;

    const newPost = await this.postRepository.save(post);

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['posts'] });

    if (!user) {
      this.logger.error(`[create] user with id: ${userId} not found. There might be a problem in a Jwt invalidation`);
      throw new NotFoundException('User not found');
    }

    user.posts.push(post);

    await this.userRepository.save(user);

    return { post: newPost };
  }

  async update(userId: number, postId: number, updatePostDto: UpdatePostDto): Promise<PostBody> {
    const { title, text, attachment, subnodditId } = updatePostDto;

    const post = await this.isPostValid(userId, postId);

    if (title) post.title = title;
    if (text) post.text = text;
    if (attachment) post.attachment = attachment;
    if (subnodditId) {
      const subnoddit = await this.subnodditRepository.findOne(subnodditId);
      if (!subnoddit) {
        throw new NotFoundException('Subnoddit not found');
      }
      post.subnoddit = subnoddit;
    }

    const updatedPost = await this.postRepository.save(post);

    return { post: updatedPost };
  }

  async delete(userId: number, postId: number): Promise<MessageResponse> {
    const post = await this.isPostValid(userId, postId);

    const { affected } = await this.postRepository.delete(post.id);

    if (affected !== 1) {
      throw new InternalServerErrorException();
    }

    return { message: 'Post successfully removed.' };
  }

  async vote(userId: number, postId: number, votePostDto: VotePostDto): Promise<MessageResponse> {
    const { direction } = votePostDto;

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      this.logger.error(`[vote] user with id: ${userId} not found. There might be a problem in a Jwt invalidation`);
      throw new NotFoundException('User not found');
    }

    const post = await this.postRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const postVote = await this.postVoteRepository
      .createQueryBuilder('postvotes')
      .where('"postvotes"."postId" = :postId', { postId })
      .andWhere('"postvotes"."userId" = :userId', { userId: user.id })
      .getOne();

    if (postVote && postVote.direction === direction) {
      // if vote is the same, set direction to 0
      postVote.direction = 0;
      await this.postVoteRepository.save(postVote);
    } else if ((postVote && postVote.direction) || (postVote && postVote.direction === 0)) {
      // If vote exists or is 0, set direction to whatever input is
      postVote.direction = direction;
      await this.postVoteRepository.save(postVote);
    } else {
      // If vote does not exist, create it
      const newPostVote = new PostVoteEntity();
      newPostVote.direction = direction;
      newPostVote.user = user;
      newPostVote.post = post;
      await this.postVoteRepository.save(newPostVote);
    }

    return { message: 'Post voted successfully.' };
  }

  // helper function
  // checks if post exists and if user is authorized to do actions on it
  private async isPostValid(userId: number, postId: number): Promise<PostEntity> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id: postId })
      .getOne();

    if (!post) {
      throw new NotFoundException();
    }

    if (post.user.id !== userId) {
      throw new UnauthorizedException();
    }

    return post;
  }

  private async sortPosts(qb: SelectQueryBuilder<PostEntity>, filter: FilterDto): Promise<PostEntity[]> {
    qb.orderBy('post.createdAt', 'DESC');

    // for pagination
    if ('limit' in filter) {
      qb.limit(filter.limit);
    }

    if ('offset' in filter) {
      qb.offset(filter.offset);
    }

    const posts = await qb.getMany();

    for (const post of posts) {
      const postVotes = await this.postVoteRepository
        .createQueryBuilder('postvotes')
        .select('SUM(postvotes.direction)', 'sum')
        .where('"postvotes"."postId" = :postId', { postId: post.id })
        .getRawOne();
      post.votes = Number(postVotes.sum) || 0;
    }

    if ('byVotes' in filter) {
      if (filter.byVotes === 'DESC') {
        posts.sort((a: PostEntity, b: PostEntity) => b.votes - a.votes);
      }

      if (filter.byVotes === 'ASC') {
        posts.sort((a: PostEntity, b: PostEntity) => a.votes - b.votes);
      }
    }

    return posts;
  }
}
