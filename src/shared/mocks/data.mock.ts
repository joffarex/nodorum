import { randomBytes, createHmac } from 'crypto';
import { hash } from 'argon2';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { S3_TOKEN } from 'src/aws/s3';

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
  createdAt: DateTime.local().toString(),
  attachment: 'attachment',
  user: { id: userId },
  subnoddit: { id: subnodditId },
});
const getPostVotes = (sum: number) => ({ sum });

let password: string;
(async () => {
  password = await hash('password');
})();

const getUser = (id: number, username: string) => ({ id, username, email: 'test@test.com', password });

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
