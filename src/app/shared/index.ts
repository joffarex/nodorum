import crypto from 'crypto';
import {config} from '../../config';

export * from './entity';
export * from './filters';
export * from './request-context';
export * from './rest.exception';
export * from './middleware/request-context.middleware';
export * from './typeorm-filter.mapper'
export * from './deep-partial'

export function passwordHash(password: string) {
	return crypto.createHmac('sha256', config.salt)
		.update(password, 'utf8')
		.digest('hex');
}