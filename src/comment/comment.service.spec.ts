import { NotFoundException, Provider, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  getOneSpy,
  getRawOneSpy,
  mockRepositoryFactory,
  getCountSpy,
  getManySpy,
  findOneSpy,
  saveSpy,
} from '../shared/mocks/spies.mock';
import {
  mockUserOne,
  mockUserTwo,
  mockPosts,
  mockComments,
  mockCommentsCount,
  mockCommentVotes,
} from '../shared/mocks/data.mock';
import { CommentService } from './comment.service';
import { UserEntity } from '../user/user.entity';
import { PostEntity } from '../post/post.entity';
import { CommentEntity } from './comment.entity';
import { CommentVoteEntity } from './comment-vote.entity';

describe('CommentService', () => {
  let commentService: CommentService;

  const mockRepositories: Provider[] = [];
  const repositoryTokenEntities = [CommentEntity, UserEntity, PostEntity, CommentVoteEntity];

  for (const entity of repositoryTokenEntities) {
    mockRepositories.push({
      provide: getRepositoryToken(entity),
      useFactory: mockRepositoryFactory,
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentService, ...mockRepositories],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  it('should return one comment', async () => {
    const comment = mockComments[0];

    getOneSpy.mockReturnValueOnce(comment);
    expect(await commentService.findOne(comment.id)).toStrictEqual({ comment });
  });

  it('should throw not found exception', async () => {
    const commentId = 9999;

    getOneSpy.mockReturnValue(undefined);
    await expect(commentService.findOne(commentId)).rejects.toBeInstanceOf(NotFoundException);
    await expect(commentService.findOne(commentId)).rejects.toThrowError('Comment not found');
  });

  // TODO: test recursive comments tree

  // it('should get comment tree without filter', async () => {
  //   findOneSpy.mockReturnValueOnce(mockPosts[0])
  //   getCountSpy.mockReturnValueOnce(mockCommentsCount)
  //   getManySpy.mockReturnValueOnce(mockComments);
  //   getRawOneSpy.mockReturnValue(mockCommentVotes);

  //   expect(await commentService.getCommentTree(mockPosts[0].id, null, {}))
  //     .toStrictEqual({
  //       comments: mockComments, commentsCount: mockCommentsCount
  //     })
  //  })

  // it('should get comment tree with limit and offset', async () => {
  //   const filter = {
  //     limit: 2,
  //     offset: 0,
  //   };
  //   const limitAndOffsetFilteredComments = mockComments.slice(filter.offset, filter.offset + filter.limit);

  //   findOneSpy.mockReturnValueOnce(mockPosts[0]);
  //   getCountSpy.mockReturnValueOnce(mockCommentsCount);
  //   getManySpy.mockReturnValueOnce(limitAndOffsetFilteredComments);
  //   getRawOneSpy.mockReturnValue(mockCommentVotes);

  //   expect(await commentService.getCommentTree(mockPosts[0].id, null, filter)).toStrictEqual({
  //     comments: limitAndOffsetFilteredComments,
  //     commentsCount: mockCommentsCount,
  //   });
  //  })

  // it('should get comment tree with most voted on top', async () => {
  //   const unorderedComments = [];
  //   let voteSpy = getRawOneSpy;
  //   for (const comment of mockComments) {
  //     if (comment.id % 2 === 0) {
  //       unorderedComments.push(comment);
  //       voteSpy = voteSpy.mockReturnValueOnce({ sum: 0 });
  //     } else {
  //       unorderedComments.push(comment);
  //       voteSpy = voteSpy.mockReturnValueOnce({ sum: 1 });
  //     }
  //   }

  //   findOneSpy.mockReturnValueOnce(mockUserOne);
  //   getCountSpy.mockReturnValueOnce(mockCommentsCount);
  //   getManySpy.mockReturnValueOnce(unorderedComments);

  //   const { comments } = await commentService.getCommentTree(mockPosts[0].id, null, { byVotes: 'DESC' });

  //   expect(comments[0].votes).toBe(0);
  //   expect(comments[comments.length - 1].votes).toBe(1);
  // })

  // it('should get comment tree with least voted on top', async () => {
  //   const unorderedComments = [];
  //   let voteSpy = getRawOneSpy;
  //   for (const comment of mockComments) {
  //     if (comment.id % 2 === 0) {
  //       unorderedComments.push(comment);
  //       voteSpy = voteSpy.mockReturnValueOnce({ sum: 0 });
  //     } else {
  //       unorderedComments.push(comment);
  //       voteSpy = voteSpy.mockReturnValueOnce({ sum: 1 });
  //     }
  //   }

  //   findOneSpy.mockReturnValueOnce(mockUserOne);
  //   getCountSpy.mockReturnValueOnce(mockCommentsCount);
  //   getManySpy.mockReturnValueOnce(unorderedComments);

  //   const { comments } = await commentService.getCommentTree(mockPosts[0].id, null, { byVotes: 'ASC' });

  //   expect(comments[0].votes).toBe(1);
  //   expect(comments[comments.length - 1].votes).toBe(0);
  // })

  // it('should throw post not found exception in comment tree', async () => {
  //   findOneSpy.mockReturnValueOnce(undefined);

  //   await expect(commentService.getCommentTree(999, null, { })).rejects.toBeInstanceOf(NotFoundException);
  //   await expect(commentService.getCommentTree(999, null, { })).rejects.toThrowError('Post not found');
  //  })

  it('should get user comments without any filter', async () => {
    const mockUserComments = mockComments.filter(comment => comment.user.id === mockUserOne.id);
    const mockUserCommentsCount = mockUserComments.length;

    findOneSpy.mockReturnValueOnce(mockUserOne);
    getCountSpy.mockReturnValueOnce(mockUserCommentsCount);
    getManySpy.mockReturnValueOnce(mockUserComments);
    getRawOneSpy.mockReturnValue(mockCommentVotes);

    expect(await commentService.getUserComments(mockUserOne.id, {})).toStrictEqual({
      comments: mockUserComments,
      commentsCount: mockUserCommentsCount,
    });
  });

  it('should get user comments with limit and offset', async () => {
    const filter = {
      limit: 2,
      offset: 0,
    };

    const mockUserComments = mockComments.filter(comment => comment.user.id === mockUserOne.id);
    const limitAndOffsetFilteredComments = mockUserComments.slice(filter.offset, filter.offset + filter.limit);
    const mockUserCommentsCount = mockUserComments.length;

    findOneSpy.mockReturnValueOnce(mockUserOne);
    getCountSpy.mockReturnValueOnce(mockUserCommentsCount);
    getManySpy.mockReturnValueOnce(limitAndOffsetFilteredComments);
    getRawOneSpy.mockReturnValue(mockCommentVotes);

    expect(await commentService.getUserComments(mockUserOne.id, filter)).toStrictEqual({
      comments: limitAndOffsetFilteredComments,
      commentsCount: mockUserCommentsCount,
    });
  });

  it('should throw user not fount exception in user comments list', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(commentService.getUserComments(999, {})).rejects.toBeInstanceOf(NotFoundException);
    await expect(commentService.getUserComments(999, {})).rejects.toThrowError('User not found');
  });

  it('should get user comments with most votes on top', async () => {
    const mockUserComments = mockComments.filter(comment => comment.user.id === mockUserOne.id);
    const unorderedComments = [];
    let voteSpy = getRawOneSpy;
    for (const comment of mockUserComments) {
      if (comment.id % 2 === 0) {
        unorderedComments.push(comment);
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 0 });
      } else {
        unorderedComments.push(comment);
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 1 });
      }
    }

    findOneSpy.mockReturnValueOnce(mockUserOne);
    getCountSpy.mockReturnValueOnce(mockCommentsCount);
    getManySpy.mockReturnValueOnce(unorderedComments);

    const { comments } = await commentService.getUserComments(mockUserOne.id, { byVotes: 'DESC' });

    expect(comments[0].votes).toBe(1);
    expect(comments[comments.length - 1].votes).toBe(0);
  });

  it('should get user comments with least votes on top', async () => {
    const mockUserComments = mockComments.filter(comment => comment.user.id === mockUserOne.id);
    const unorderedComments = [];
    let voteSpy = getRawOneSpy;
    for (const comment of mockUserComments) {
      if (comment.id % 2 === 0) {
        unorderedComments.push(comment);
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 0 });
      } else {
        unorderedComments.push(comment);
        voteSpy = voteSpy.mockReturnValueOnce({ sum: 1 });
      }
    }

    findOneSpy.mockReturnValueOnce(mockUserOne);
    getCountSpy.mockReturnValueOnce(mockCommentsCount);
    getManySpy.mockReturnValueOnce(unorderedComments);

    const { comments } = await commentService.getUserComments(mockUserOne.id, { byVotes: 'ASC' });

    expect(comments[0].votes).toBe(0);
    expect(comments[comments.length - 1].votes).toBe(1);
  });

  it('should create post', async () => {
    const mockComment = {
      text: mockComments[0].text,
      parentId: null,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    saveSpy.mockReturnValueOnce(mockComments[0]);

    expect(await commentService.create(mockUserOne.id, mockPosts[0].id, mockComment)).toStrictEqual({
      comment: mockComments[0],
    });
  });

  it('should throw user not found exception in create', async () => {
    const mockComment = {
      text: mockComments[0].text,
      parentId: null,
    };

    findOneSpy.mockReturnValue(undefined);

    await expect(commentService.create(mockUserOne.id, mockPosts[0].id, mockComment)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(commentService.create(mockUserOne.id, mockPosts[0].id, mockComment)).rejects.toThrowError(
      'User not found',
    );
  });

  it('should throw post not found exception in create', async () => {
    const mockComment = {
      text: mockComments[0].text,
      parentId: null,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(commentService.create(mockUserOne.id, mockPosts[0].id, mockComment)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(commentService.create(mockUserOne.id, mockPosts[0].id, mockComment)).rejects.toThrowError(
      'Post not found',
    );
  });

  it('should update post', async () => {
    const mockComment = {
      text: mockComments[0].text,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(mockComments[0]);
    saveSpy.mockReturnValueOnce(mockComments[0]);

    expect(
      await commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).toStrictEqual({ comment: mockComments[0] });
  });

  it('should throw use not found exception in update', async () => {
    const mockComment = {
      text: mockComments[0].text,
    };

    findOneSpy.mockReturnValue(undefined);

    await expect(
      commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toThrowError('User not found');
  });

  it('should throw post not found exception in update', async () => {
    const mockComment = {
      text: mockComments[0].text,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(
      commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toBeInstanceOf(NotFoundException);

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(
      commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toThrowError('Post not found');
  });

  it('should throw comment not found exception if comment does not exist in update', async () => {
    const mockComment = {
      text: mockComments[0].text,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(undefined);
    await expect(
      commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toBeInstanceOf(NotFoundException);

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(undefined);
    await expect(
      commentService.update(mockUserOne.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toThrowError('Comment not found');
  });

  it('should throw unauthorized exception if provided user id does not match', async () => {
    const mockComment = {
      text: mockComments[0].text,
    };

    findOneSpy.mockReturnValueOnce(mockUserTwo).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(mockComments[0]);
    await expect(
      commentService.update(mockUserTwo.id, mockPosts[0].id, mockComments[0].id, mockComment),
    ).rejects.toThrowError(UnauthorizedException);
  });

  it('should remove post', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(mockComments[0]);
    saveSpy.mockReturnValueOnce({});

    expect(await commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).toStrictEqual({
      message: 'Comment successfully removed',
    });
  });

  it('should throw use not found exception in delete', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).rejects.toThrowError(
      'User not found',
    );
  });

  it('should throw post not found exception in delete', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).rejects.toThrowError(
      'Post not found',
    );
  });

  it('should throw comment not found exception if comment does not exist in delete', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(undefined);
    await expect(commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(undefined);
    await expect(commentService.delete(mockUserOne.id, mockPosts[0].id, mockComments[0].id)).rejects.toThrowError(
      'Comment not found',
    );
  });

  it('should throw unauthorized exception if provided user id does not match', async () => {
    findOneSpy.mockReturnValueOnce(mockUserTwo).mockReturnValueOnce(mockPosts[0]);
    getOneSpy.mockReturnValueOnce(mockComments[0]);
    await expect(commentService.delete(mockUserTwo.id, mockPosts[0].id, mockComments[0].id)).rejects.toThrowError(
      UnauthorizedException,
    );
  });

  it('should upvote comment', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockComments[0]);
    getOneSpy.mockReturnValueOnce(undefined);

    expect(await commentService.vote(mockUserOne.id, mockComments[0].id, { direction: 1 })).toStrictEqual({
      message: 'Comment upvoted successfully',
    });
  });

  it('should downvote comment', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockComments[0]);
    getOneSpy.mockReturnValueOnce(undefined);

    expect(await commentService.vote(mockUserOne.id, mockComments[0].id, { direction: -1 })).toStrictEqual({
      message: 'Comment downvoted successfully',
    });
  });

  it('should reset comment votes to 0 if direction(1) is the same', async () => {
    const mockCommentVoteOne = { direction: 1 };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockComments[0]);
    getOneSpy.mockReturnValueOnce(mockCommentVoteOne);

    expect(await commentService.vote(mockUserOne.id, mockComments[0].id, mockCommentVoteOne)).toStrictEqual({
      message: 'Comment vote reset',
    });
  });

  it('should reset comment votes to 0 if direction(-1) is the same', async () => {
    const mockCommentVoteNegOne = { direction: -1 };

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockComments[0]);
    getOneSpy.mockReturnValueOnce(mockCommentVoteNegOne);

    expect(await commentService.vote(mockUserOne.id, mockComments[0].id, mockCommentVoteNegOne)).toStrictEqual({
      message: 'Comment vote reset',
    });
  });

  it('should upvote comment where comment vote already exists and is 0', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockComments[0]);
    getOneSpy.mockReturnValueOnce({ direction: 0 });

    expect(await commentService.vote(mockUserOne.id, mockComments[0].id, { direction: 1 })).toStrictEqual({
      message: 'Comment upvoted',
    });
  });

  it('should downvote comment where comment vote already exists and is 0', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockComments[0]);
    getOneSpy.mockReturnValueOnce({ direction: 0 });

    expect(await commentService.vote(mockUserOne.id, mockComments[0].id, { direction: -1 })).toStrictEqual({
      message: 'Comment downvoted',
    });
  });

  it('should downvote comment where comment vote already exists and is 0', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(commentService.vote(mockUserOne.id, mockComments[0].id, { direction: 999 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(commentService.vote(mockUserOne.id, mockComments[0].id, { direction: 999 })).rejects.toThrowError(
      'User not found',
    );
  });

  it('should downvote comment where comment vote already exists and is 0', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(commentService.vote(mockUserOne.id, mockComments[0].id, { direction: 999 })).rejects.toBeInstanceOf(
      NotFoundException,
    );

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(commentService.vote(mockUserOne.id, mockComments[0].id, { direction: 999 })).rejects.toThrowError(
      'Comment not found',
    );
  });
});
