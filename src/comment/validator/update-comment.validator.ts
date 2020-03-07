import Joi from '@hapi/joi';

export const updateSchema = Joi.object().keys({
  text: Joi.string().required(),
});
