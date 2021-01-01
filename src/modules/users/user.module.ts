import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/infrastructure/entities';
import { UserController } from './user.controller';
import { USER_SERVICE, UserService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [{ useClass: UserService, provide: USER_SERVICE }],
  exports: [UserService],
})
export class UserModule {}
