import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { PasswordResetEntity } from './password-reset.entity';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetEntity, UserEntity])],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, ConfigService],
})
export class PasswordResetModule {}
