import { createParamDecorator } from '@nestjs/common';

export const ReqUrl = createParamDecorator((data, req) => {
  return req.raw.url;
});
