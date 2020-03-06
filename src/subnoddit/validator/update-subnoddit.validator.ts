import Joi from '@hapi/joi';
import { string } from './base.validator';

export const updateSchema = Joi.object().keys({
  name: string,
  image: string,
  about: string,
  status: Joi.string().allow('ACTIVE', 'NOT_ACTIVE'),
});
