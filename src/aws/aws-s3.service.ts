import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import AWS from 'aws-sdk';
import { AppLogger } from 'src/app.logger';

@Injectable()
export class AwsS3Service {
  private readonly s3: AWS.S3;
  private logger = new AppLogger('AwsS3Service');

  constructor(@Inject('CLIENT_CONFIG') private readonly clientConfig: AWS.S3.Types.ClientConfiguration) {
    this.s3 = new AWS.S3(this.clientConfig);
  }

  public async upload(params: AWS.S3.Types.PutObjectRequest): Promise<{ key: string }> {
    try {
      const info = await this.s3.putObject(params).promise();

      this.logger.log(`success[S3]: ${JSON.stringify(info)}`);

      return {
        key: params.Key,
      };
    } catch (err) {
      this.logger.error(err.message);
      throw new BadRequestException('Image upload failed');
    }
  }
}
