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
import {
  mockUserOne,
  mockUserTwo,
  mockSubnodditOne,
  mockSubnodditTwo,
  DatabaseDuplicateError,
  MockConfigService,
} from '../shared/mocks/data.mock';
import { SubnodditService } from './subnoddit.service';
import { PostEntity } from '../post/post.entity';
import { UserEntity } from '../user/user.entity';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { ConfigService } from '@nestjs/config';
import { S3_TOKEN } from '../aws/s3';

describe('SubnodditService', () => {
  let subnodditService: SubnodditService;

  const mockRepositories: Provider[] = [];
  const repositoryTokenEntities = [PostEntity, UserEntity, SubnodditEntity];

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
      providers: [SubnodditService, ...mockProviders, ...mockRepositories],
    }).compile();

    subnodditService = module.get<SubnodditService>(SubnodditService);
  });

  it('should be defined', () => {
    expect(subnodditService).toBeDefined();
  });

  it('should create subnoddit', async () => {
    const mockSubnoddit = {
      name: mockSubnodditOne.name,
      about: mockSubnodditOne.about,
      image: mockSubnodditOne.image,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockSubnoddit.image);
    saveSpy.mockReturnValueOnce(mockSubnodditOne);

    const { subnoddit } = await subnodditService.create(mockUserOne.id, mockSubnoddit);

    expect(subnoddit.id).toBe(mockSubnodditOne.id);
    expect(subnoddit.name).toBe(mockSubnoddit.name);
    expect(subnoddit.about).toBe(mockSubnoddit.about);
    expect(subnoddit.image).toBe(mockSubnoddit.image);
    expect(subnoddit.user.id).toBe(mockUserOne.id);
  });

  it('should create subnoddit without optional fields', async () => {
    const mockSubnoddit = {
      name: mockSubnodditOne.name,
      about: mockSubnodditOne.about,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockReturnValueOnce(mockSubnodditOne);

    const { subnoddit } = await subnodditService.create(mockUserOne.id, mockSubnoddit);

    expect(subnoddit.id).toBe(mockSubnodditOne.id);
    expect(subnoddit.name).toBe(mockSubnoddit.name);
    expect(subnoddit.about).toBe(mockSubnoddit.about);
    expect(subnoddit.user.id).toBe(mockUserOne.id);
  });

  it('should throw user not found exception if user does not exist', async () => {
    const mockSubnoddit = {
      name: mockSubnodditOne.name,
      about: mockSubnodditOne.about,
      image: mockSubnodditOne.image,
    };

    findOneSpy.mockReturnValue(undefined);

    await expect(subnodditService.create(999, mockSubnoddit)).rejects.toBeInstanceOf(NotFoundException);
    await expect(subnodditService.create(999, mockSubnoddit)).rejects.toThrowError('User not found');
  });

  it('should throw conflict exception if subnoddit with provided name already exists', async () => {
    const mockSubnoddit = {
      name: mockSubnodditOne.name,
      about: mockSubnodditOne.about,
    };

    findOneSpy.mockReturnValue(mockUserOne);
    saveSpy.mockImplementation(() => {
      throw new DatabaseDuplicateError('23505');
    });

    await expect(subnodditService.create(999, mockSubnoddit)).rejects.toBeInstanceOf(ConflictException);
    await expect(subnodditService.create(999, mockSubnoddit)).rejects.toThrowError(
      'Subnoddit with provided name already exists',
    );
  });

  it('should throw internal server exception if there is a database error other than duplicate entry', async () => {
    const mockSubnoddit = {
      name: mockSubnodditOne.name,
      about: mockSubnodditOne.about,
      image: mockSubnodditOne.image,
    };

    findOneSpy.mockReturnValueOnce(mockUserOne);
    promiseSpy.mockReturnValueOnce(mockSubnoddit.image);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23506');
    });
    await expect(subnodditService.create(999, mockSubnoddit)).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('should find one subnoddit', async () => {
    const mockSubnoditPostsCount = 0;
    getOneSpy.mockReturnValueOnce(mockSubnodditOne);
    getCountSpy.mockReturnValueOnce(mockSubnoditPostsCount);

    expect(await subnodditService.findOne(mockSubnodditOne.id)).toStrictEqual({
      subnoddit: mockSubnodditOne,
      subnodditPostsCount: mockSubnoditPostsCount,
    });
  });

  it('should throw subnoddit not found exception', async () => {
    getOneSpy.mockReturnValue(undefined);

    await expect(subnodditService.findOne(mockSubnodditOne.id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(subnodditService.findOne(mockSubnodditOne.id)).rejects.toThrowError('Subnoddit not found');
  });

  it('should find many subnoddits without any filter', async () => {
    const mockSubnoddits = [mockSubnodditOne, mockSubnodditTwo];
    const mockSubnodditsCount = mockSubnoddits.length;
    getCountSpy.mockReturnValueOnce(mockSubnodditsCount);
    getManySpy.mockReturnValueOnce(mockSubnoddits);

    expect(await subnodditService.findMany({})).toStrictEqual({
      subnoddits: mockSubnoddits,
      subnodditsCount: mockSubnodditsCount,
    });
  });

  it('should find only user subnoddits', async () => {
    const mockSubnoddits = [mockSubnodditOne, mockSubnodditTwo];

    const usernameFilteredSubnoddits = mockSubnoddits.filter(subnoddit => subnoddit.user.id === mockUserOne.id);
    const mockSubnodditsCount = usernameFilteredSubnoddits.length;

    findOneSpy.mockReturnValueOnce(mockUserOne);
    getCountSpy.mockReturnValueOnce(mockSubnodditsCount);
    getManySpy.mockReturnValueOnce(usernameFilteredSubnoddits);

    expect(await subnodditService.findMany({ username: mockUserOne.username })).toStrictEqual({
      subnoddits: usernameFilteredSubnoddits,
      subnodditsCount: mockSubnodditsCount,
    });
  });

  it('should throw user not found exception if specified username does not belong to any user', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(subnodditService.findMany({ username: 'any' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(subnodditService.findMany({ username: 'any' })).rejects.toThrowError('User not found');
  });

  it('should find many subnoddits with name, limit and offset filters', async () => {
    const filter = { name: 'tes', offset: 0, limit: 2 };

    const mockSubnoddits = [mockSubnodditOne, mockSubnodditTwo];

    const nameFilteredPosts = mockSubnoddits.filter(post => post.name.includes('tes'));
    const limitAndOffsetFilteredPosts = nameFilteredPosts.slice(filter.offset, filter.offset + filter.limit);

    const mockSubnodditsCount = nameFilteredPosts.length;

    findOneSpy.mockReturnValueOnce(mockUserOne);
    getCountSpy.mockReturnValueOnce(mockSubnodditsCount);
    getManySpy.mockReturnValueOnce(limitAndOffsetFilteredPosts);

    expect(await subnodditService.findMany(filter)).toStrictEqual({
      subnoddits: limitAndOffsetFilteredPosts,
      subnodditsCount: mockSubnodditsCount,
    });
  });

  it('should update subnoddit', async () => {
    const body = {
      name: 'update',
      about: 'update',
      image: 'updated',
    };

    const mockUpdateSubnoddit = { ...mockSubnodditOne, ...body };

    getOneSpy.mockReturnValueOnce(mockSubnodditOne);
    promiseSpy.mockReturnValueOnce(body.image);
    saveSpy.mockReturnValueOnce(mockUpdateSubnoddit);

    expect(
      await subnodditService.update(mockUserOne.id, mockSubnodditOne.id, {
        ...body,
        status: 'ACTIVE',
      }),
    ).toStrictEqual({ subnoddit: mockUpdateSubnoddit });
  });

  it('should throw subnoddit not found exceition in update', async () => {
    getOneSpy.mockReturnValue(undefined);

    await expect(subnodditService.update(mockUserOne.id, mockSubnodditOne.id, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(subnodditService.update(mockUserOne.id, mockSubnodditOne.id, {})).rejects.toThrowError(
      'Subnoddit not found',
    );
  });

  it('should throw unauthorized exceition if userId does not match subnoddit user', async () => {
    getOneSpy.mockReturnValueOnce(mockSubnodditOne);

    await expect(subnodditService.update(mockUserTwo.id, mockSubnodditOne.id, {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should throw conflict exception if subnoddit with provided name already exists in update', async () => {
    getOneSpy.mockReturnValue(mockSubnodditOne);

    saveSpy.mockImplementation(() => {
      throw new DatabaseDuplicateError('23505');
    });
    await expect(subnodditService.update(mockUserOne.id, mockSubnodditOne.id, {})).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(subnodditService.update(mockUserOne.id, mockSubnodditOne.id, {})).rejects.toThrowError(
      'Subnoddit with provided name already exists',
    );
  });

  it('should throw internal server exception if there is a database error other than duplicate entry in update', async () => {
    getOneSpy.mockReturnValueOnce(mockSubnodditOne);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23506');
    });
    await expect(subnodditService.update(mockUserOne.id, mockSubnodditOne.id, {})).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should delete subnoddit', async () => {
    getOneSpy.mockReturnValueOnce(mockSubnodditOne);
    getCountSpy.mockReturnValueOnce(0);
    deleteSpy.mockReturnValueOnce({ affected: 1 });

    expect(await subnodditService.delete(mockUserOne.id, mockSubnodditOne.id)).toStrictEqual({
      message: 'Post successfully removed.',
    });
  });

  it('should throw bad request exception if there are posts in subnoddit while deleting', async () => {
    const mockSubnodditPostsCount = 1;

    getOneSpy.mockReturnValue(mockSubnodditOne);
    getCountSpy.mockReturnValue(mockSubnodditPostsCount);

    await expect(subnodditService.delete(mockUserOne.id, mockSubnodditOne.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(subnodditService.delete(mockUserOne.id, mockSubnodditOne.id)).rejects.toThrowError(
      `There are ${mockSubnodditPostsCount} posts in this subnoddit and it can not be removed`,
    );
  });

  it('should throw subnoddit not found error in delete', async () => {
    getOneSpy.mockReturnValue(undefined);

    await expect(subnodditService.delete(mockUserOne.id, mockSubnodditOne.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(subnodditService.delete(mockUserOne.id, mockSubnodditOne.id)).rejects.toThrowError(
      'Subnoddit not found',
    );
  });

  it('should throw unauthorized exception in delete', async () => {
    getOneSpy.mockReturnValueOnce(mockSubnodditOne);

    await expect(subnodditService.delete(mockUserTwo.id, mockSubnodditOne.id)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should throw internal server error exception if more than one subnoddit got removed', async () => {
    getOneSpy.mockReturnValueOnce(mockSubnodditOne);
    getCountSpy.mockReturnValueOnce(0);
    deleteSpy.mockReturnValueOnce({ affected: 2 });

    await expect(subnodditService.delete(mockUserOne.id, mockSubnodditOne.id)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
