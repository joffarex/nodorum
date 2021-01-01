import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppLogger } from './shared/core';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'fastify-helmet';
import compress from 'fastify-compress';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { InternalServerErrorException } from '@nestjs/common';

export class AppMain {
  private _app!: NestFastifyApplication;
  private readonly _logger = new AppLogger('Server');

  async bootstrap(): Promise<void> {
    this._app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));

    const config = this._app.get(ConfigService) as ConfigService;

    this._app.enableCors();
    await this._app.register(compress);

    if (config.get<boolean>('isProduction')) {
      await this._app.register(helmet, {
        contentSecurityPolicy: false,
      });
    }

    const options = new DocumentBuilder()
      .setTitle('Nodorum')
      .setDescription('The Nodorum API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(this._app, options);
    SwaggerModule.setup('api', this._app, document);

    const port = config.get<number>('port');
    const host = config.get<string>('host');

    if (!port || !host) {
      throw new InternalServerErrorException();
    }

    await this._app.listen(port);
    this._logger.log(`Server listening on http://${host}:${port}`);
  }
}
