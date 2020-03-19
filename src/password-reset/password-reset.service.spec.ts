import { Test, TestingModule } from '@nestjs/testing';
import {
  Provider,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nest-modules/mailer';
import { getRepositoryToken } from '@nestjs/typeorm';
import stubTransport from 'nodemailer-stub-transport';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetEntity } from './password-reset.entity';
import { UserEntity } from '../user/user.entity';
import { getOneSpy, mockRepositoryFactory, findOneSpy, saveSpy, deleteSpy } from '../shared/mocks/spies.mock';
import {
  mockUserOne,
  mockPasswordResetOne,
  mockQueryOne,
  mockQueryTwo,
  mockPasswordResetTwo,
  DatabaseDuplicateError,
  MockConfigService,
} from '../shared/mocks/data.mock';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('PasswordResetService', () => {
  let passwordResetService: PasswordResetService;

  const mockRepositories: Provider[] = [];
  const repositoryTokenEntities = [PasswordResetEntity, UserEntity];

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
      providers: [PasswordResetService, ...mockProviders, ...mockRepositories],
    }).compile();

    passwordResetService = module.get<PasswordResetService>(PasswordResetService);
  });

  it('should be defined', () => {
    expect(passwordResetService).toBeDefined();
  });

  it('should send forgot password email', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockReturnValueOnce(mockPasswordResetOne);

    const res = await passwordResetService.forgotPassword({ email: mockUserOne.email });

    expect(res).toStrictEqual({ message: `Email sent to ${mockUserOne.email}` });
  });

  it('should throw user not found exception in forgot password', async () => {
    findOneSpy.mockReturnValue(undefined);

    await expect(passwordResetService.forgotPassword({ email: 'test@test.com' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(passwordResetService.forgotPassword({ email: 'test@test.com' })).rejects.toThrowError(
      'User not found',
    );
  });

  it('should throw conflict exception if reset for user already exists', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23505');
    });
    await expect(passwordResetService.forgotPassword({ email: mockUserOne.email })).rejects.toBeInstanceOf(
      ConflictException,
    );

    findOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23505');
    });
    await expect(passwordResetService.forgotPassword({ email: mockUserOne.email })).rejects.toThrowError(
      'Password reset email has already been sent',
    );
  });

  it('should throw internal server exception if there is a database error other than duplicate entry', async () => {
    findOneSpy.mockReturnValueOnce(mockUserOne);
    saveSpy.mockImplementationOnce(() => {
      throw new DatabaseDuplicateError('23506');
    });

    await expect(passwordResetService.forgotPassword({ email: mockUserOne.email })).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should reset password', async () => {
    const body = {
      password: 'updatedpass',
    };

    findOneSpy.mockReturnValueOnce(mockPasswordResetOne);
    getOneSpy.mockReturnValueOnce(mockUserOne);
    deleteSpy.mockReturnValueOnce({});

    const res = await passwordResetService.resetPassword(mockQueryOne, body);

    expect(res).toStrictEqual({ message: 'Password reset successfully' });
  });

  it('should throw bad request exception when reset does not exist', async () => {
    const body = {
      password: 'updatedpass',
    };

    findOneSpy.mockReturnValue(undefined);

    await expect(passwordResetService.resetPassword(mockQueryOne, body)).rejects.toBeInstanceOf(BadRequestException);
    await expect(passwordResetService.resetPassword(mockQueryOne, body)).rejects.toThrowError(
      'Invalid password reset token',
    );
  });

  it('should throw bad request exception when reset is not valid', async () => {
    const body = {
      password: 'updatedpass',
    };

    findOneSpy.mockReturnValue(mockPasswordResetTwo);
    await expect(passwordResetService.resetPassword(mockQueryOne, body)).rejects.toBeInstanceOf(BadRequestException);
    await expect(passwordResetService.resetPassword(mockQueryOne, body)).rejects.toThrowError(
      'Invalid password reset token',
    );

    findOneSpy.mockReturnValue(mockPasswordResetOne);

    await expect(passwordResetService.resetPassword(mockQueryTwo, body)).rejects.toBeInstanceOf(BadRequestException);
    await expect(passwordResetService.resetPassword(mockQueryTwo, body)).rejects.toThrowError(
      'Invalid password reset token',
    );

    findOneSpy.mockReturnValueOnce(mockPasswordResetOne);
    getOneSpy.mockReturnValueOnce(undefined);
    await expect(passwordResetService.resetPassword(mockQueryOne, body)).rejects.toBeInstanceOf(BadRequestException);

    await expect(passwordResetService.resetPassword(mockQueryOne, body)).rejects.toThrowError(
      'Invalid password reset token',
    );
  });
});
