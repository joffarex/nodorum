import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubnodditController } from './subnoddit.controller';
import { SubnodditService } from './subnoddit.service';
import { SubnodditEntity } from './subnoddit.entity';
import { UserEntity } from '../user/user.entity';
import { PostEntity } from '../post/post.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SubnodditEntity, UserEntity, PostEntity])],
  controllers: [SubnodditController],
  providers: [SubnodditService],
  exports: [SubnodditService],
})
export class SubnodditModule {}
