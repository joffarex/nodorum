import { NotFoundException, Provider, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  getOneSpy,
  getRawOneSpy,
  mockRepositoryFactory,
  getCountSpy,
  orderBySpy,
  limitSpy,
  offsetSpy,
  getManySpy,
  findOneSpy,
} from '../shared/mocks';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { PostVoteEntity } from './post-vote.entity';
import { UserEntity } from '../user/user.entity';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { FollowerEntity } from '../user/follower.entity';

type postOptions = {
  userId?: number;
  subnodditId?: number;
};
const getPost = (id: number, { userId, subnodditId }: postOptions) => ({
  id,
  title: 'post',
  text: 'kappa',
  createdAt: Date.now(),
  userId,
  subnodditId,
});
const getPostVotes = (sum: number) => ({ sum });

const getUser = (id: number, username: string) => ({
  id,
  username,
});

const getSubnoddit = (id: number, name: string) => ({
  id,
  name,
});

const mockUserOne = getUser(1, 'test');
const mockUserTwo = getUser(2, 'test2');
const mockSubnodditOne = getSubnoddit(1, 'test');
const mockSubnodditTwo = getSubnoddit(2, 'test2');
const mockPostVotes = getPostVotes(0);
const mockPosts = [
  { ...getPost(1, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }), votes: mockPostVotes.sum },
  { ...getPost(2, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }), votes: mockPostVotes.sum },
  { ...getPost(3, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }), votes: mockPostVotes.sum },
  { ...getPost(4, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }), votes: mockPostVotes.sum },
  { ...getPost(5, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }), votes: mockPostVotes.sum },
  { ...getPost(6, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }), votes: mockPostVotes.sum },
];
const mockPostsCount = mockPosts.length;

describe('PostService', () => {
  let postService: PostService;

  const mockRepositories: Provider[] = [];
  const repositoryTokenEntities = [PostEntity, PostVoteEntity, UserEntity, SubnodditEntity, FollowerEntity];

  for (const entity of repositoryTokenEntities) {
    mockRepositories.push({
      provide: getRepositoryToken(entity),
      useFactory: mockRepositoryFactory,
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, ...mockRepositories],
    }).compile();

    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  it('should return one post', async () => {
    const post = mockPosts[0];

    getOneSpy.mockReturnValueOnce(post);
    getRawOneSpy.mockReturnValueOnce(mockPostVotes);
    expect(await postService.findOne(post.id)).toStrictEqual({ post });
  });

  it('should throw not found exception', async () => {
    const postId = 9999;

    getOneSpy.mockReturnValueOnce(undefined);
    await expect(postService.findOne(postId)).rejects.toBeInstanceOf(NotFoundException);
    await expect(postService.findOne(postId)).rejects.toThrowError('Post not found');
  });

  it('should find many posts without any filter', async () => {
    getCountSpy.mockReturnValueOnce(mockPostsCount);
    getManySpy.mockReturnValueOnce(mockPosts);
    getRawOneSpy.mockReturnValue(mockPostVotes);
    expect(await postService.findMany({})).toStrictEqual({ posts: mockPosts, postsCount: mockPostsCount });
  });

  it('should find many posts with specified username, limit and offset', async () => {
    const filter = {
      username: mockUserOne.username,
      limit: 2,
      offset: 1,
    };

    const usernameFilteredPosts = mockPosts.filter(post => {
      return post.userId === (mockUserOne.username === filter.username ? mockUserOne.id : null);
    });
    const limitAndOffsetFilteredPosts = usernameFilteredPosts.slice(filter.offset, filter.offset + filter.limit);

    getCountSpy.mockReturnValueOnce(mockPostsCount);
    getManySpy.mockReturnValueOnce(limitAndOffsetFilteredPosts);
    getRawOneSpy.mockReturnValue(mockPostVotes);
    findOneSpy.mockReturnValueOnce(mockUserOne);
    expect(await postService.findMany(filter)).toStrictEqual({
      posts: limitAndOffsetFilteredPosts,
      postsCount: mockPostsCount,
    });
  });

  it('should find many posts with specified subnodditId, limit and offset', async () => {
    const filter = {
      subnodditId: mockSubnodditOne.id,
      limit: 2,
      offset: 1,
    };

    const subnodditFilteredPosts = mockPosts.filter(post => {
      return post.subnodditId === (mockSubnodditOne.id === filter.subnodditId ? mockSubnodditOne.id : null);
    });
    const limitAndOffsetFilteredPosts = subnodditFilteredPosts.slice(filter.offset, filter.offset + filter.limit);

    getCountSpy.mockReturnValueOnce(mockPostsCount);
    getManySpy.mockReturnValueOnce(limitAndOffsetFilteredPosts);
    getRawOneSpy.mockReturnValue(mockPostVotes);
    findOneSpy.mockReturnValueOnce(mockSubnodditOne);
    expect(await postService.findMany(filter)).toStrictEqual({
      posts: limitAndOffsetFilteredPosts,
      postsCount: mockPostsCount,
    });
  });

  it('should throw internal server error if both username and subnodditId are in filter', async () => {
    const filter = {
      username: 'test',
      subnodditId: 1,
    };

    await expect(postService.findMany(filter)).rejects.toBeInstanceOf(InternalServerErrorException);
    await expect(postService.findMany(filter)).rejects.toThrowError('Wrong filters');
  });

  it('should return most voted post on top', async () => {
    const unorderedPosts = [];
    let voteSpy = getRawOneSpy;
    for (const p of mockPosts) {
      if (p.id % 2 === 0) {
        unorderedPosts.push({ ...p, votes: 0 });
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 0 })
      } else {
        unorderedPosts.push({ ...p, votes: 1 });
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 1 })
      }
    }

    const filter: { byVotes: 'DESC' | 'ASC' } = { byVotes: 'DESC' };

    getCountSpy.mockReturnValueOnce(mockPostsCount);
    getManySpy.mockReturnValueOnce(unorderedPosts);
    findOneSpy.mockReturnValueOnce(mockSubnodditOne);

    const { posts } = await postService.findMany(filter);

    expect(posts[0].votes).toBe(1);
    expect(posts[posts.length - 1].votes).toBe(0);
  });
});
