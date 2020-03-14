import Joi from '@hapi/joi'

  export const forgotPasswordSchema = Joi.object().keys({
    email:Joi.string()
    .email()
    .min(8)
    .max(255)
    .trim()
    .lowercase()
    .required()
  });
  