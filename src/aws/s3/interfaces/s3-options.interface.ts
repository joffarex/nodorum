import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface S3ConfigOptions {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

export interface S3ConfigAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<S3ConfigOptions> | S3ConfigOptions;
}
