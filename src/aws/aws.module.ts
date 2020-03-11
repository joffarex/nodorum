import { Module, DynamicModule } from '@nestjs/common';
import {AwsS3ModuleAsyncOptions} from './interfaces/aws-s3-module-options.interface'
import { AwsS3Service } from './aws-s3.service';

@Module({
})
export class AwsModule {
  static forRootS3Async(options: AwsS3ModuleAsyncOptions): DynamicModule {
    return {
        module: AwsModule,
        providers: [
            {
                provide: 'CLIENT_CONFIG',
                useFactory: options.useFactory,
                inject: options.inject || [],
            },
            AwsS3Service,
        ],
        exports: [AwsS3Service],
    };
}}
