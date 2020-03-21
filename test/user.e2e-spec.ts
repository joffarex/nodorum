import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { UserService } from '../src/user/user.service';
import { AuthService } from '../src/auth/auth.service';
import { MockConfigService, mockS3ClientFactory, MockAuthService, mockPayload } from '../src/shared/mocks';
import { S3_TOKEN } from '../src/aws/s3';
import { UserController } from '../src/user/user.controller';

describe('User', () => {
  let app: NestFastifyApplication;
  let authHeader: string;
  const userSevice = {
    findAll: () => ['test'],
    findOne: () => ({ user: { id: 1, username: 'joffarex', email: 'joffarex@gmail.com' } }),
  };

  const mockProviders: Provider[] = [
    {
      provide: ConfigService,
      useClass: MockConfigService,
    },
    {
      provide: S3_TOKEN,
      useFactory: mockS3ClientFactory,
    },
    {
      provide: AuthService,
      useClass: MockAuthService,
    },
  ];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [...mockProviders, UserService],
      controllers: [UserController],
    })
      .overrideProvider(UserService)
      .useValue(userSevice)
      .compile();

    authHeader = new MockAuthService().getAccessToken(mockPayload(userSevice.findOne()));

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        logger: false,
      }),
    );
    await app.init();
  });

  it(`/GET me`, () => {
    return app
      .inject({
        method: 'GET',
        url: '/user/me',
        headers: {
          authorization: `Bearer ${authHeader}`,
        },
      })
      .then(({ payload }) => expect(JSON.parse(payload)).toStrictEqual(userSevice.findOne()));
  });

  afterAll(async () => {
    await app.close();
  });
});
