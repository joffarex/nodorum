import { Module, DynamicModule } from '@nestjs/common';
import { S3ConfigAsyncOptions } from './s3/interfaces/s3-options.interface';
import { S3Module } from './s3/s3.module';

@Module({})
export class AwsModule {
  static forRootS3Async(options: S3ConfigAsyncOptions): DynamicModule {
    return {
      module: AwsModule,
      imports: [S3Module.forRootAsync(options)],
    };
  }
}
