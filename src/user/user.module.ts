import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nest-modules/mailer';
import { redisProvider } from 'src/shared/redis.provider';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { FollowerEntity } from './follower.entity';
import { AuthService } from 'src/auth/auth.service';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowerEntity]), AwsModule, MailerModule],
  controllers: [UserController],
  providers: [UserService, ...redisProvider, AuthService],
  exports: [UserService],
})
export class UserModule {}
