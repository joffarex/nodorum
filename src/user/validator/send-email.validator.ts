import Joi from '@hapi/joi';
import { email } from './base.validator';

export const sendEmailSchema = Joi.object().keys({
  email,
});
