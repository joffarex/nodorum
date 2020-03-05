import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value, { abortEarly: false });
    if (error) {
      throw new UnprocessableEntityException(error.message, 'Validation Failed');
    }
    return value;
  }
}
