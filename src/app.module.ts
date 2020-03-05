import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppLogger } from './app.logger';
import { UserModule } from './user/user.module';
import { config } from 'src/config';

@Module({
  imports: [TypeOrmModule.forRoot(config.database), AuthModule, UserModule],
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
