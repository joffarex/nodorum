import Joi from '@hapi/joi';

export const createSchema = Joi.object().keys({
  title: Joi.string().required(),
  text: Joi.string(),
  attachment: Joi.string().trim(),
  subnodditId: Joi.number().required(),
});
