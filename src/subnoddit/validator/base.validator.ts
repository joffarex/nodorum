import Joi from '@hapi/joi';

export const string = Joi.string().trim().required();