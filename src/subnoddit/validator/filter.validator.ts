import Joi from '@hapi/joi'

export const filterSchema = Joi.object().keys({
  username: Joi.string().trim(),
limit: Joi.number(),
offset: Joi.number(),
name: Joi.string().trim(),
})