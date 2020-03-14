import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisProvider } from 'src/shared/redis.provider';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { FollowerEntity } from './follower.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowerEntity])],
  controllers: [UserController],
  providers: [UserService, ...redisProvider, AuthService], // can not import AuthModule because forwardRef can not be used here
  exports: [UserService],
})
export class UserModule {}
