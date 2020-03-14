import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { PasswordResetEntity } from './password-reset.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PasswordResetEntity])],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, ConfigService],
})
export class PasswordResetModule {}
