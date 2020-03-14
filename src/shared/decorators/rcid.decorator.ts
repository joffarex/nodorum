import { v1 as uuid } from 'uuid';
import { createParamDecorator } from '@nestjs/common';

export const Rcid = createParamDecorator((data, req) => {
  req.rcid = uuid();
  return req.rcid;
});
