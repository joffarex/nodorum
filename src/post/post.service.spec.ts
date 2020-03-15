import { NotFoundException, Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getOneSpy, getRawOneSpy, mockRepositoryFactory } from '../shared/mocks';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { PostVoteEntity } from './post-vote.entity';
import { UserEntity } from '../user/user.entity';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { FollowerEntity } from '../user/follower.entity';

const getPost = (id: number) => ({ id, title: 'post', text: 'kappa' });
const getPostVotes = (sum: number) => ({ sum });

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
    const postId = 1;
    const post = getPost(postId);
    const postVotes = getPostVotes(0);

    getOneSpy.mockReturnValueOnce(post);
    getRawOneSpy.mockReturnValueOnce(postVotes);
    expect(await postService.findOne(postId)).toStrictEqual({ post: { ...post, votes: postVotes.sum } });
  });

  it('should throw not found exception', async () => {
    const postId = 2;

    getOneSpy.mockReturnValueOnce(undefined);
    await expect(postService.findOne(postId)).rejects.toBeInstanceOf(NotFoundException);
    await expect(postService.findOne(postId)).rejects.toThrowError('Post not found');
  });
});
