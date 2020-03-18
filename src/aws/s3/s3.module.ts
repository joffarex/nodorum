import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';
import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { S3ConfigOptions, S3ConfigAsyncOptions } from './interfaces/s3-options.interface';
import { S3Service } from './s3.service';
import { S3_CONFIG_OPTIONS, S3_TOKEN } from './s3.constants';

@Global()
@Module({})
export class S3Module {
  public static forRootAsync(options: S3ConfigAsyncOptions): DynamicModule {
    const provider: Provider = {
      inject: [S3_CONFIG_OPTIONS],
      provide: S3_TOKEN,
      useFactory: (options: S3ConfigOptions): S3 => {
        AWS.config.update({
          accessKeyId: options.accessKeyId,
          secretAccessKey: options.secretAccessKey,
          region: options.region,
        });

        const client = new S3({ apiVersion: '2006-03-01' });
        return client;
      },
    };

    const configProvider: Provider = {
      inject: options.inject || [],
      provide: S3_CONFIG_OPTIONS,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      useFactory: options.useFactory!,
    };

    return {
      exports: [provider, S3Service],
      imports: options.imports,
      module: S3Module,
      providers: [configProvider, provider, S3Service],
    };
  }
}
