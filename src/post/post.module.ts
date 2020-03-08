import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { UserEntity } from 'src/user/user.entity';
import { SubnodditEntity } from 'src/subnoddit/subnoddit.entity';
import { PostVoteEntity } from './post-vote.entity';
import { FollowerEntity } from 'src/user/follower.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([PostEntity, UserEntity, SubnodditEntity, PostVoteEntity, FollowerEntity])],
  controllers: [PostController],
  providers: [PostService, AuthService],
})
export class PostModule {}
