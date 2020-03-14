import { ObjectSchema } from '@hapi/joi';
import { PipeTransform, Injectable, ArgumentMetadata, UnprocessableEntityException } from '@nestjs/common';

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
