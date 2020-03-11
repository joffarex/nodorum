import Redis from 'ioredis';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type RedisClient = Redis.Redis;

export const redisProvider: Array<Provider> = [
  {
    useFactory: (configService: ConfigService): RedisClient => {
      return new Redis({
        host: configService.get<string>('redis.host'),
        port: configService.get<number>('redis.port'),
        password: configService.get<string>('redis.password'),
      });
    },
    provide: 'REDIS_CLIENT',
    inject: [ConfigService],
  },
];
