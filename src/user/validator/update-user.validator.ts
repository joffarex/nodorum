import Joi from '@hapi/joi';
import { displayName, profileImage, bio } from './base.validator';

export const updateSchema = Joi.object().keys({
  displayName,
  profileImage,
  bio,
});
