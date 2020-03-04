import Joi from '@hapi/joi';

export const loginSchema = Joi.object().keys({
  username: Joi.string()
    .alphanum()
    .required(),
  password: Joi.string().required(),
});
