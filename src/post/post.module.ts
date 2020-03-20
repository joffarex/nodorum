import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { UserEntity } from '../user/user.entity';
import { SubnodditEntity } from '../subnoddit/subnoddit.entity';
import { PostVoteEntity } from './post-vote.entity';
import { FollowerEntity } from '../user/follower.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PostEntity, UserEntity, SubnodditEntity, PostVoteEntity, FollowerEntity]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
