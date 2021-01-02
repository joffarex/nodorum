import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/infrastructure/entities';
import { UserController } from './user.controller';
import { USER_SERVICE, UserService } from './services';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';
import { CommandHandlers } from './commands';
import { UserSagas } from './sagas';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    {
      useClass: UserService,
      provide: USER_SERVICE,
    },
    ...QueryHandlers,
    ...EventHandlers,
    ...CommandHandlers,
    UserSagas,
  ],
  exports: [UserService],
})
export class UserModule {}
