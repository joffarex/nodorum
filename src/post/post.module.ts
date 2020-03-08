import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { UserEntity } from 'src/user/user.entity';
import { SubnodditEntity } from 'src/subnoddit/subnoddit.entity';
import { PostVoteEntity } from './post-vote.entity';
import { FollowerEntity } from 'src/user/follower.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, UserEntity, SubnodditEntity, PostVoteEntity, FollowerEntity])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
