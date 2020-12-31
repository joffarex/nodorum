import { Module } from '@nestjs/common';
import { AppLogger } from './shared/core';
import { ConfigModule } from '@nestjs/config';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
})
export class AppModule {
  private _logger = new AppLogger(AppModule.name);

  constructor() {
    this._logger.log('Initialize constructor');
  }
}
