import Joi from '@hapi/joi';
import { email, username, password, displayName, profileImage, bio } from './base.validator';

export const registerSchema = Joi.object().keys({
  email,
  password,
  username,
  displayName,
  profileImage,
  bio,
});
