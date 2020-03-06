import Joi from '@hapi/joi';
import { string } from './base.validator';

export const createSchema = Joi.object().keys({
  name: string,
  image: string,
  about: string,
});
