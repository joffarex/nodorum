import { INestApplicationContext, InternalServerErrorException } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import helmet from 'fastify-helmet'
import compress from 'fastify-compress'
import { AppLogger } from './app.logger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters';
import { ConfigService } from '@nestjs/config';

export class AppMain {
  private app!: NestFastifyApplication;
  private logger = new AppLogger('Server');

  async bootstrap(): Promise<void> {
    this.app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        logger: false,
      }),
    );

      const config = this.app.get(ConfigService);

    this.app.enableCors()
    this.app.register(compress)
    this.app.useGlobalFilters(new HttpExceptionFilter());
    if (config.get<boolean>('isProduction')) {
      this.app.register(helmet)
    }

    const port = config.get<number>('port')
    const host = config.get<string>('host');

    if (!port || !host) {
      throw new InternalServerErrorException()
    }

    await this.app.listen(port);
    this.logger.log(`Server listening on http://${host}:${port}`)
  }

  async shutdown(): Promise<void> {
    await this.app.close();
  }

  public getContext(): Promise<INestApplicationContext> {
    return NestFactory.createApplicationContext(AppModule);
  }
}
