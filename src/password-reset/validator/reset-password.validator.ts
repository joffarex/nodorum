import Joi from '@hapi/joi'

  export const resetPasswordSchema = Joi.object().keys({
    password:Joi.string()
    .min(8)
    .max(50)
    .required()
    .regex(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s]).*/)
    .message('Password must have at least one lowercase letter, one uppercase letter, one digit and one symbol.')
  });
  