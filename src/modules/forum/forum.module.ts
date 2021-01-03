import { Module } from '@nestjs/common';
import { CommentModule } from './comments/comment.module';
import { PostModule } from './posts/post.module';

@Module({ imports: [CommentModule, PostModule] })
export class ForumModule {}
