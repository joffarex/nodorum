import Joi from '@hapi/joi';

export const voteSchema = Joi.object().keys({
  direction: Joi.number()
    .valid(1, 0, -1)
    .required(),
});
