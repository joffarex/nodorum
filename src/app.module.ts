import {Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubnodditModule } from './subnoddit/subnoddit.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'noddit.cmhmvv8ismwh.eu-west-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres' ,
      password: 'Zfvfy2XQks3RTaLr',
      database: 'noddit',
      synchronize: true,
      logging: 'all',
      entities: [`dist/**/*.entity{.ts,.js}`],
    },),
    AuthModule, UserModule, SubnodditModule, PostModule, CommentModule],
})
export class AppModule {}
