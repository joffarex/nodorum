import { Module } from '@nestjs/common';
import { SubnodditController } from './subnoddit.controller';
import { SubnodditService } from './subnoddit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubnodditEntity } from './subnoddit.entity';
import { UserEntity } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubnodditEntity, UserEntity])],
  controllers: [SubnodditController],
  providers: [SubnodditService],
})
export class SubnodditModule {}
