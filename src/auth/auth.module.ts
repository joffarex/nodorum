import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { redisProvider } from 'src/shared/redis.provider';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, ConfigModule],
  providers: [AuthService, ...redisProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
