import AWS from 'aws-sdk';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AppLogger } from 'src/app.logger';
import { logFormat } from 'src/shared';
import { CLIENT_CONFIG } from './aws.constants';
import { AwsS3UploadOptions } from './interfaces/aws-s3-module-options.interface';

@Injectable()
export class AwsS3Service {
  private readonly s3: AWS.S3;
  private logger = new AppLogger('AwsS3Service');

  constructor(@Inject(CLIENT_CONFIG) private readonly clientConfig: AWS.S3.Types.ClientConfiguration) {
    this.s3 = new AWS.S3(this.clientConfig);
  }

  async upload(params: AWS.S3.Types.PutObjectRequest, opts?: AwsS3UploadOptions): Promise<{ key: string }> {
    try {
      const info = await this.s3.putObject(params).promise();

      if (opts) {
        this.logger.debug(logFormat(opts.rcid, 'upload', `success[S3]: ${JSON.stringify(info)}`, {}, opts.user));
      }

      return {
        key: params.Key,
      };
    } catch (err) {
      this.logger.error(err.message);
      throw new BadRequestException('Image upload failed');
    }
  }
}
