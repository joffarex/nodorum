import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppLogger } from './app.logger';
import { UserModule } from './user/user.module';
import { config } from 'src/config';
import { SubnodditModule } from './subnoddit/subnoddit.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [TypeOrmModule.forRoot(config.database), AuthModule, UserModule, SubnodditModule, PostModule, CommentModule],
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
