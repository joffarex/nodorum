import { Module } from '@nestjs/common';
import { AppLogger } from './shared/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('isProduction') ? false : 'all',
        entities: configService.get<Array<string>>('database.entities'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
})
export class AppModule {
  private _logger = new AppLogger(AppModule.name);

  constructor() {
    this._logger.log('Initialize constructor');
  }
}
