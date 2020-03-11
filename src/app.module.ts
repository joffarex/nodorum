import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubnodditModule } from './subnoddit/subnoddit.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import config from './config';
import { AppLogger } from './app.logger';
import { RequestContextMiddleware } from './shared';
import {MailerModule, PugAdapter} from '@nest-modules/mailer'

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
          from:'"noddit" <no-reply@noddit.app>',
        },
        template: {
          dir: `${__dirname}/../templates`,
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],

    }),
    AuthModule,
    UserModule,
    SubnodditModule,
    PostModule,
    CommentModule,
  ],
})
export class AppModule {
  private logger = new AppLogger(AppModule.name);

  constructor() {
    this.logger.log('Initialize constructor');
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
