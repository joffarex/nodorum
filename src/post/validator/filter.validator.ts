import Joi from '@hapi/joi';

export const filterSchema = Joi.object().keys({
  username: Joi.string(),
  limit: Joi.number(),
  offset: Joi.number(),
  subnodditId: Joi.number(),
  byVotes: Joi.string().allow('DESC', 'ASC'),
});
