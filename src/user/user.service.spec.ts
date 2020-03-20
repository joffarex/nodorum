import {
  NotFoundException,
  Provider,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  getOneSpy,
  mockRepositoryFactory,
  getCountSpy,
  getManySpy,
  findOneSpy,
  saveSpy,
  deleteSpy,
  mockS3ClientFactory,
  promiseSpy,
} from '../shared/mocks/spies.mock';
import { mockUserOne, mockUserTwo, DatabaseDuplicateError, MockConfigService } from '../shared/mocks/data.mock';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { S3_TOKEN } from '../aws/s3';
import { FollowerEntity } from './follower.entity';
import { MailerModule } from '@nest-modules/mailer';
import stubTransport from 'nodemailer-stub-transport';
import { hash } from 'argon2';
import { DateTime } from 'luxon';

describe('UserService', () => {
  let userService: UserService;

  const mockRepositories: Provider[] = [];
  const repositoryTokenEntities = [UserEntity, FollowerEntity];

  for (const entity of repositoryTokenEntities) {
    mockRepositories.push({
      provide: getRepositoryToken(entity),
      useFactory: mockRepositoryFactory,
    });
  }

  const mockProviders: Provider[] = [
    {
      provide: ConfigService,
      useClass: MockConfigService,
    },
    {
      provide: S3_TOKEN,
      useFactory: mockS3ClientFactory,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule.forRootAsync({
          useFactory: () => ({
            transport: stubTransport(),
            defaults: {
              from: '"noddit" <no-reply@noddit.app>',
            },
          }),
        }),
      ],
      providers: [UserService, ...mockProviders, ...mockRepositories],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should register user without optional fields', async () => {
    const mockUser = {
      username: mockUserOne.username,
      email: mockUserOne.email,
      password: 'password',
    };

    saveSpy.mockReturnValueOnce(mockUserOne);

    expect(await userService.register(mockUser)).toStrictEqual({ user: mockUserOne });
  });

  it('should register user with optional fields', async () => {
    const mockUser = {
      username: mockUserOne.username,
      email: mockUserOne.email,
      password: 'password',
      displayName: mockUserOne.displayName,
      profileImage: mockUserOne.profileImage,
      bio: mockUserOne.bio,
    };

    saveSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockUserOne.profileImage);

    expect(await userService.register(mockUser)).toStrictEqual({ user: mockUserOne });
  });

  it('should throw conflict exception if user already exists', async () => {
    const mockUser = {
      username: mockUserOne.username,
      email: mockUserOne.email,
      password: 'password',
    };

    saveSpy.mockImplementation(() => {
      throw new DatabaseDuplicateError('23505');
    });
    await expect(userService.register(mockUser)).rejects.toBeInstanceOf(ConflictException);
    await expect(userService.register(mockUser)).rejects.toThrowError('Username or email has already been registered');
  });

  it('should throw internal server exception if there is a database error other than duplicate entry', async () => {
    const mockUser = {
      username: mockUserOne.username,
      email: mockUserOne.email,
      password: 'password',
    };
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23506');
    });

    await expect(userService.register(mockUser)).rejects.toThrow(InternalServerErrorException);
  });

  it('should log user in', async () => {
    const mockUser = {
      username: mockUserOne.username,
      password: 'password',
    };

    mockUserOne.password = await hash('password');

    getOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockUserOne);

    expect(await userService.login(mockUser)).toStrictEqual({ user: mockUserOne });
  });

  it('should throw unauthorized exception if credentials are wrong', async () => {
    const mockUser = {
      username: mockUserOne.username,
      password: 'wrongpassword',
    };

    mockUserOne.password = await hash('password');

    getOneSpy.mockReturnValue(undefined);

    await expect(userService.login(mockUser)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(userService.login(mockUser)).rejects.toThrowError('Invalid credentials');

    getOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(mockUserOne);

    await expect(userService.login(mockUser)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(userService.login(mockUser)).rejects.toThrowError('Invalid credentials');
  });

  it('should find user by id', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);

    expect(await userService.findOne(mockUserOne.id)).toStrictEqual({ user: mockUserOne });
  });

  it('should throw user not found exception in find by id', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.findOne(999)).rejects.toThrowError('User not found');
  });
  it('should find user by email', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);

    expect(await userService.findOneByEmail(mockUserOne.email)).toStrictEqual({ user: mockUserOne });
  });

  it('should throw user not found exception in find by email', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.findOneByEmail('wrong@email.com')).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.findOneByEmail('wrong@email.com')).rejects.toThrowError('User not found');
  });
  it('should find user by username', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);

    expect(await userService.findOneByUsername(mockUserOne.username)).toStrictEqual({ user: mockUserOne });
  });

  it('should throw user not found exception in find by username', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.findOneByUsername('wrongusername')).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.findOneByUsername('wrongusername')).rejects.toThrowError('User not found');
  });

  it('should update user', async () => {
    const mockUpdatedUser = {
      displayName: 'updated',
      profileImage: 'updatedpic',
      bio: 'updated bio',
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockUpdatedUser.profileImage);
    saveSpy.mockReturnValueOnce({ ...mockUserOne, ...mockUpdatedUser });

    expect(await userService.update(mockUserOne.id, mockUpdatedUser)).toStrictEqual({
      user: { ...mockUserOne, ...mockUpdatedUser },
    });
  });

  it('should throw user not found exception in update', async () => {
    const mockUpdatedUser = {
      displayName: 'updated',
      profileImage: 'updatedpic',
      bio: 'updated bio',
    };

    findOneSpy.mockReturnValue(undefined);

    await expect(userService.update(999, mockUpdatedUser)).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.update(999, mockUpdatedUser)).rejects.toThrowError('User not found');
  });

  it('should throw conflict exception is user already exists in update', async () => {
    const mockUpdatedUser = {
      displayName: 'updated',
      profileImage: 'updatedpic',
      bio: 'updated bio',
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockUpdatedUser.profileImage);

    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23505');
    });
    await expect(userService.update(mockUserOne.id, mockUpdatedUser)).rejects.toBeInstanceOf(ConflictException);

    findOneSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockUpdatedUser.profileImage);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23505');
    });
    await expect(userService.update(mockUserOne.id, mockUpdatedUser)).rejects.toThrowError(
      'Username or email has already been registered',
    );
  });

  it('should throw internal server exception if there is a database error other than duplicate entry in update', async () => {
    const mockUpdatedUser = {
      displayName: 'updated',
      profileImage: 'updatedpic',
      bio: 'updated bio',
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockUpdatedUser.profileImage);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23506');
    });

    await expect(userService.update(mockUserOne.id, mockUpdatedUser)).rejects.toThrow(InternalServerErrorException);
  });

  it('should delete user', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockReturnValueOnce(mockUserOne);

    expect(await userService.delete(mockUserOne.id)).toStrictEqual({ message: 'User successfully removed' });
  });

  it('should throw user not found exception in delete', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.delete(999)).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.delete(999)).rejects.toThrowError('User not found');
  });

  it('should follow user', async () => {
    findOneSpy
      .mockReturnValueOnce(mockUserOne)
      .mockReturnValueOnce(mockUserTwo)
      .mockReturnValueOnce(undefined);

    saveSpy.mockReturnValueOnce({ userId: mockUserTwo.id, followerId: mockUserOne.id });

    expect(await userService.followAction(mockUserOne.id, mockUserTwo.id)).toStrictEqual({
      message: 'User followed',
    });
  });

  it('should throw user not found exception in follow', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.followAction(999, mockUserTwo.id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.followAction(999, mockUserTwo.id)).rejects.toThrowError('User not found');
  });

  it('should throw follower not found exception', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(userService.followAction(mockUserOne.id, 999)).rejects.toBeInstanceOf(NotFoundException);

    findOneSpy.mockReturnValueOnce(mockUserOne).mockReturnValueOnce(undefined);
    await expect(userService.followAction(mockUserOne.id, 999)).rejects.toThrowError(
      'User who you are trying to follow does not exist',
    );
  });

  it('should unfollow user', async () => {
    findOneSpy
      .mockReturnValueOnce(mockUserOne)
      .mockReturnValueOnce(mockUserTwo)
      .mockReturnValueOnce({ userId: mockUserTwo.id, followerId: mockUserOne.id });

    deleteSpy.mockReturnValueOnce({ affected: 1 });

    expect(await userService.followAction(mockUserOne.id, mockUserTwo.id)).toStrictEqual({
      message: 'User unfollowed',
    });
  });

  it('should throw internal server error if more than one following gets deleted', async () => {
    findOneSpy
      .mockReturnValueOnce(mockUserOne)
      .mockReturnValueOnce(mockUserTwo)
      .mockReturnValueOnce({ userId: mockUserTwo.id, followerId: mockUserOne.id });

    deleteSpy.mockReturnValueOnce({ affected: 2 });

    await expect(userService.followAction(mockUserOne.id, mockUserTwo.id)).rejects.toThrowError(
      InternalServerErrorException,
    );
  });

  it('should return user followers', async () => {
    const mockFollowers = [mockUserTwo];
    findOneSpy.mockReturnValueOnce(mockUserOne);
    getManySpy.mockReturnValueOnce(mockFollowers);
    getCountSpy.mockReturnValueOnce(mockFollowers.length);

    expect(await userService.getFollowers(mockUserOne.id)).toStrictEqual({
      followers: mockFollowers,
      followersCount: mockFollowers.length,
    });
  });

  it('should throw user not found exception in get followers', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.getFollowers(999)).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.getFollowers(999)).rejects.toThrowError('User not found');
  });

  it('should send verification email', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);

    expect(await userService.sendEmail({ email: mockUserOne.email })).toStrictEqual({
      message: `Email sent to ${mockUserOne.email}`,
    });
  });

  it('should throw user not found exception in send email', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(userService.sendEmail({ email: 'wrong@email.com' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(userService.sendEmail({ email: 'wrong@email.com' })).rejects.toThrowError('User not found');
  });

  it('should throw bad request exception if email is already verified', async () => {
    findOneSpy.mockReturnValue({ ...mockUserOne, verifiedAt: DateTime.local() });

    await expect(userService.sendEmail({ email: mockUserOne.email })).rejects.toBeInstanceOf(BadRequestException);
    await expect(userService.sendEmail({ email: mockUserOne.email })).rejects.toThrowError('Email already verified');
  });

  it('should verify email', async () => {
    getOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockReturnValueOnce({ ...mockUserOne, verifiedAt: DateTime.local() });

    jest.spyOn<any, any>(userService, 'hasValidVerificationUrl').mockReturnValueOnce(true);

    expect(
      await userService.verifyEmail({ id: mockUserOne.id, signature: 'signature' }, '/user/email/verify'),
    ).toStrictEqual({ message: 'Email verified successfully' });
  });

  it('should throw bad request exception is activation link is invalid', async () => {
    jest.spyOn<any, any>(userService, 'hasValidVerificationUrl').mockReturnValue(false);
    getOneSpy.mockReturnValue({ ...mockUserOne, verifiedAt: DateTime.local() });

    await expect(userService.verifyEmail({ id: mockUserOne.id }, '/user/email/verify')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(userService.verifyEmail({ id: mockUserOne.id }, '/user/email/verify')).rejects.toThrowError(
      'Invalid activation link',
    );
  });

  it('should throw bad request exception if email is already verified in verify', async () => {
    jest.spyOn<any, any>(userService, 'hasValidVerificationUrl').mockReturnValue(true);
    getOneSpy.mockReturnValue({ ...mockUserOne, verifiedAt: DateTime.local() });

    await expect(userService.verifyEmail({ id: mockUserOne.id }, '/user/email/verify')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(userService.verifyEmail({ id: mockUserOne.id }, '/user/email/verify')).rejects.toThrowError(
      'Email already verified',
    );
  });
});
