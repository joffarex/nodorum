import Joi from '@hapi/joi';

export const createSchema = Joi.object().keys({
  text: Joi.string().required(),
  parentId: Joi.number(),
});
