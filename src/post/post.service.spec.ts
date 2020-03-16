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
  saveSpy,
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

type MockPost = {
  id: number;
  title: string;
  text: string;
  createdAt: string;
  attachment?: string;
  user: { id?: number };
  subnoddit: { id?: number };
};

const getPost = (id: number, { userId, subnodditId }: postOptions): MockPost => ({
  id,
  title: 'post',
  text: 'kappa',
  createdAt: Date.now().toString(),
  attachment: 'attachment',
  user: {
    id: userId,
  },
  subnoddit: {
    id: subnodditId,
  },
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
const mockPosts: MockPost[] = [
  { ...getPost(1, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(2, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(3, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(4, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(5, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(6, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
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
      return post.user.id === (mockUserOne.username === filter.username ? mockUserOne.id : null);
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
      return post.subnoddit.id === (mockSubnodditOne.id === filter.subnodditId ? mockSubnodditOne.id : null);
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
    for (const post of mockPosts) {
      if (post.id % 2 === 0) {
        unorderedPosts.push(post);
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 0 });
      } else {
        unorderedPosts.push(post);
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 1 });
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

  // -----
  // newsfeed
  // -----

  it('should create new post without optional fields', async () => {
    const mockPost = {
      title: mockPosts[0].title,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      subnodditId: mockPosts[0].subnoddit.id!,
    };

    findOneSpy.mockReturnValue(mockUserOne);
    findOneSpy.mockReturnValue(mockSubnodditOne);
    saveSpy.mockReturnValueOnce(mockPosts[0]);

    const { post } = await postService.create(mockUserOne.id, mockPost);

    expect(post.id).toBe(mockPosts[0].id);
    expect(post.title).toBe(mockPost.title);
    expect(post.subnoddit.id).toBe(mockPost.subnodditId);
    expect(post.user.id).toBe(mockUserOne.id);
  });

  it('should create new post with optional fields', async () => {
    const mockPost = {
      title: mockPosts[0].title,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      subnodditId: mockPosts[0].subnoddit.id!,
      text: mockPosts[0].text,
      attachment: mockPosts[0].attachment,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    findOneSpy.mockReturnValueOnce(mockSubnodditOne);
    saveSpy.mockReturnValueOnce(mockPosts[0]);

    const { post } = await postService.create(mockUserOne.id, mockPost);

    expect(post.id).toBe(mockPosts[0].id);
    expect(post.title).toBe(mockPost.title);
    expect(post.subnoddit.id).toBe(mockPost.subnodditId);
    expect(post.user.id).toBe(mockUserOne.id);
  });

  it('should throw user not found exception while creating post', async () => {
    const mockPost = {
      title: mockPosts[0].title,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      subnodditId: mockPosts[0].subnoddit.id!,
      text: mockPosts[0].text,
    };

    findOneSpy.mockReturnValue(undefined);

    await expect(postService.create(mockUserOne.id, mockPost)).rejects.toBeInstanceOf(NotFoundException);
    await expect(postService.create(mockUserOne.id, mockPost)).rejects.toThrowError('User not found');
  });

  it('should throw subnoddit not found exception while creating post', async () => {
    const mockPost = {
      title: mockPosts[0].title,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      subnodditId: mockPosts[0].subnoddit.id!,
      text: mockPosts[0].text,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(postService.create(mockUserOne.id, mockPost)).rejects.toBeInstanceOf(NotFoundException);
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(postService.create(mockUserOne.id, mockPost)).rejects.toThrowError('Subnoddit not found');
  });
});
