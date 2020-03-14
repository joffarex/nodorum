import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/post/post.entity';
import { UserEntity } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthService } from 'src/auth/auth.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentEntity } from './comment.entity';
import { CommentVoteEntity } from './comment-vote.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([CommentEntity, PostEntity, UserEntity, CommentVoteEntity])],
  controllers: [CommentController],
  providers: [CommentService, AuthService],
})
export class CommentModule {}
