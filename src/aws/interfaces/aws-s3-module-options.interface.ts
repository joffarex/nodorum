import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ConfigurationOptions } from 'aws-sdk/lib/config';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

export interface AwsS3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<ConfigurationOptions> | ConfigurationOptions;
  inject?: any[];
}

export interface AwsS3UploadOptions {
  rcid: string;
  user: JwtPayload | null
}