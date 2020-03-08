import { Module } from '@nestjs/common';
import { SubnodditController } from './subnoddit.controller';
import { SubnodditService } from './subnoddit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubnodditEntity } from './subnoddit.entity';
import { UserEntity } from 'src/user/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([SubnodditEntity, UserEntity])],
  controllers: [SubnodditController],
  providers: [SubnodditService, AuthService],
  exports: [SubnodditService],
})
export class SubnodditModule {}
