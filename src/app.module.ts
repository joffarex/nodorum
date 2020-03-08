import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppLogger } from './app.logger';
import { UserModule } from './user/user.module';
import { config } from 'src/config';
import { SubnodditModule } from './subnoddit/subnoddit.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'noddit.cmhmvv8ismwh.eu-west-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres' ,
      password: 'Zfvfy2XQks3RTaLr',
      database: 'noddit',
      synchronize: true,
      logging: 'all',
      entities: [`dist/**/*.entity{.ts,.js}`],
    },),
    AuthModule, UserModule, SubnodditModule, PostModule, CommentModule],
})
export class AppModule {
  private logger = new AppLogger('AppModule');

  constructor() {
    this.logger.log('Initialize constructor');
  }

  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(RequestContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  // }
}
