import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nest-modules/mailer';
import { AppLogger } from './app.logger';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubnodditModule } from './subnoddit/subnoddit.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AwsModule } from './aws/aws.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('isProduction') ? false : 'all',
        entities: configService.get<Array<string>>('database.entities'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get<string>('smtpTransport'),
        defaults: {
          from: '"noddit" <no-reply@noddit.app>',
        },
      }),
      inject: [ConfigService],
    }),
    AwsModule.forRootS3Async({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        accessKeyId: configService.get<string>('aws.accessKeyId')!,
        secretAccessKey: configService.get<string>('aws.accessKeyId')!,
        region: configService.get<string>('aws.region')!,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    SubnodditModule,
    PostModule,
    CommentModule,
    AwsModule,
    PasswordResetModule,
  ],
})
export class AppModule {
  private logger = new AppLogger(AppModule.name);

  constructor() {
    this.logger.log('Initialize constructor');
  }
}
