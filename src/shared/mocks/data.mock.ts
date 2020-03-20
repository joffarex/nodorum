import { randomBytes, createHmac } from 'crypto';
import { hash } from 'argon2';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';

type postOptions = {
  userId?: number;
  subnodditId?: number;
};

type commentOptions = {
  userId?: number;
  postId?: number;
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

type MockComment = {
  id: number;
  text: string;
  createdAt: string;
  deletedAt: string | null;
  parentId: string | null;
  user: { id?: number };
  post: { id?: number };
};

const getPost = (id: number, { userId, subnodditId }: postOptions): MockPost => ({
  id,
  title: 'post',
  text: 'kappa',
  createdAt: DateTime.local().toString(),
  attachment: 'attachment',
  user: { id: userId },
  subnoddit: { id: subnodditId },
});
const getPostVotes = (sum: number) => ({ sum });

const getComment = (id: number, { userId, postId }: commentOptions): MockComment => ({
  id,
  text: 'kappa',
  createdAt: DateTime.local().toString(),
  deletedAt: null,
  parentId: null,
  user: { id: userId },
  post: { id: postId },
});
const getCommentVotes = (sum: number) => ({ sum });

let password: string;
(async () => {
  password = await hash('password');
})();

const getUser = (id: number, username: string) => ({
  id,
  username,
  email: 'test@test.com',
  password,
  displayName: 'test',
  profileImage: 'kappa',
  bio: 'testbio',
});

const getSubnoddit = (id: number, name: string, userId: number) => ({
  id,
  image: 'test',
  about: 'test',
  name,
  user: { id: userId },
});

export const mockUserOne = getUser(1, 'test');
export const mockUserTwo = getUser(2, 'test2');

export const mockSubnodditOne = getSubnoddit(1, 'test', mockUserOne.id);
export const mockSubnodditTwo = getSubnoddit(2, 'test2', mockUserTwo.id);

export const mockPostVotes = getPostVotes(0);
export const mockPosts: MockPost[] = [
  { ...getPost(1, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(2, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(3, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(4, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(5, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(6, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(7, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(8, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
];
export const mockPostsCount = mockPosts.length;

export const mockCommentVotes = getCommentVotes(0);
export const mockComments: MockComment[] = [
  { ...getComment(1, { userId: mockUserOne.id, postId: mockPosts[0].id }) },
  { ...getComment(2, { userId: mockUserTwo.id, postId: mockPosts[1].id }) },
  { ...getComment(3, { userId: mockUserOne.id, postId: mockPosts[0].id }) },
  { ...getComment(4, { userId: mockUserTwo.id, postId: mockPosts[1].id }) },
  { ...getComment(5, { userId: mockUserOne.id, postId: mockPosts[0].id }) },
  { ...getComment(6, { userId: mockUserOne.id, postId: mockPosts[0].id }) },
  { ...getComment(7, { userId: mockUserOne.id, postId: mockPosts[0].id }) },
  { ...getComment(8, { userId: mockUserOne.id, postId: mockPosts[0].id }) },
  { ...getComment(9, { userId: mockUserTwo.id, postId: mockPosts[1].id }) },
];
export const mockCommentsCount = mockComments.length;

export const mockUpdatePost = {
  title: 'update',
  text: 'yay',
  attachment: 'attachment',
  subnodditId: 2,
};

export const mockToken = randomBytes(32).toString('hex');

export const mockPasswordResetOne = {
  id: 1,
  user: mockUserOne,
  token: createHmac('sha256', '53CR3T')
    .update(mockToken)
    .digest('hex'),
  createdAt: DateTime.local().toString(),
  expiredAt: DateTime.local()
    .plus({ minutes: 15 })
    .toString(),
};

export const mockPasswordResetTwo = {
  id: 1,
  user: mockUserOne,
  token: createHmac('sha256', '53CR3T')
    .update(mockToken)
    .digest('hex'),
  createdAt: DateTime.local().toString(),
  expiredAt: DateTime.local()
    .minus({ minutes: 15 })
    .toString(),
};

export const mockQueryOne = {
  id: mockPasswordResetOne.id,
  token: mockToken,
};

export const mockQueryTwo = {
  id: mockPasswordResetOne.id,
  token: 'wrongtoken',
};

export class DatabaseDuplicateError extends Error {
  code: string;

  constructor(code: string, ...params: any[]) {
    super(...params);

    this.code = code;
  }
}

export class MockConfigService extends ConfigService {
  constructor() {
    super();
  }

  get(name: string): string {
    switch (name) {
      case 'hmacSecret':
        return '53CR3T';
      case 'host':
        return 'localhost';
      case 'aws.s3BucketName':
        return 'test';
      default:
        return '';
    }
  }
}
