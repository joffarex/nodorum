import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { FollowerEntity } from './follower.entity';
import { AuthService } from 'src/auth/auth.service';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowerEntity])],
  controllers: [UserController],
  providers: [UserService, AuthService, AwsS3Service],
  exports: [UserService],
})
export class UserModule {}
