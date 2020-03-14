import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubnodditController } from './subnoddit.controller';
import { SubnodditService } from './subnoddit.service';
import { SubnodditEntity } from './subnoddit.entity';
import { UserEntity } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { PostEntity } from 'src/post/post.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([SubnodditEntity, UserEntity, PostEntity])],
  controllers: [SubnodditController],
  providers: [SubnodditService],
  exports: [SubnodditService],
})
export class SubnodditModule {}
