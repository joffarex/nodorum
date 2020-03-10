import { createParamDecorator } from '@nestjs/common';
import { v1 as uuid } from 'uuid';

export const Rcid = createParamDecorator((data, req) => {
  req.rcid = uuid();
  return req.rcid;
});
