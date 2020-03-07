import { INestApplication, INestApplicationContext } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import helmet from 'helmet';
import qs from 'qs-middleware';
import { config } from './config';
import { AppLogger } from './app.logger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters';

export class AppMain {
  private app!: INestApplication;
  private logger = new AppLogger('Main');

  async bootstrap(): Promise<void> {
    await this.createServer();
    // this.createMicroservices();
    // await this.startMicroservices();
    return this.startServer();
  }

  async shutdown(): Promise<void> {
    await this.app.close();
  }

  public getContext(): Promise<INestApplicationContext> {
    return NestFactory.createApplicationContext(AppModule);
  }

  private async createServer(): Promise<void> {
    this.app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        logger: new AppLogger('Server'),
      }),
    );
    this.app.use(cors());
    this.app.use(qs());
    this.app.useGlobalFilters(new HttpExceptionFilter());
    this.app.setGlobalPrefix('/api/v1');
    if (config.isProduction) {
      this.app.use(helmet());
    }
  }

  // private createMicroservices(): void {
  // 	this.microservice = this.app.connectMicroservice(config.microservice);
  // }

  // private startMicroservices(): Promise<void> {
  // 	return this.app.startAllMicroservicesAsync();
  // }

  private async startServer(): Promise<void> {
    await this.app.listen(config.port, config.host);
    this.logger.log(`Server is listening http://${config.host}:${config.port}`);
  }
}
