import Joi from '@hapi/joi';

export const email = Joi.string()
  .email()
  .min(8)
  .max(255)
  .trim()
  .lowercase()
  .required();
export const username = Joi.string()
  .min(8)
  .max(255)
  .alphanum()
  .lowercase()
  .required();
export const password = Joi.string()
  .min(8)
  .max(50)
  .required()
  .regex(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s]).*/)
  .message('Password must have at least one lowercase letter, one uppercase letter, one digit and one symbol.');
  export const displayName = Joi.string().trim();
  export const profileImage = Joi.string().trim();
  export const bio = Joi.string().trim();