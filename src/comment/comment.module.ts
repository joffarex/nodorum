import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { PostEntity } from 'src/post/post.entity';
import { UserEntity } from 'src/user/user.entity';
import { CommentVoteEntity } from './comment-vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, PostEntity, UserEntity, CommentVoteEntity])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
