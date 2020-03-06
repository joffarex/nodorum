import Joi from '@hapi/joi';

export const updateSchema = Joi.object().keys({
  title: Joi.string(),
  text: Joi.string(),
  attachment: Joi.string().trim(),
  subnodditId: Joi.number(),
});
