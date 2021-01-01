import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infrastructure/entities';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { USER_SERVICE } from './services/user-service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [{ useClass: UserService, provide: USER_SERVICE }],
  exports: [UserService],
})
export class UserModule {}
