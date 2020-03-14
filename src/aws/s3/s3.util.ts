import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';
import { S3ConfigOptions } from './interfaces/s3-options.interface';

export function createS3Client(options: S3ConfigOptions): S3 {
  AWS.config.update({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: options.region,
  });

  const client = new S3({ apiVersion: '2006-03-01' });
  return client;
}
