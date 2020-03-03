import {sign, verify} from 'jsonwebtoken';
import {UserEntity} from '../../user/entity';
import {config} from '../../../config';
import {TokenDto} from '../dto/token.dto';

export function createToken(id: string, expiresIn: number, secret: string) {
	return sign({id}, secret, {
		expiresIn,
		audience: config.session.domain,
		issuer: config.uuid
	});
}


export async function createAuthToken({id}: UserEntity) {
	const expiresIn = config.session.timeout;
	const accessToken = createToken(id, expiresIn, config.session.secret);
	const refreshToken = createToken(id, config.session.refresh.timeout, config.session.refresh.secret);
	return {
		expiresIn,
		accessToken,
		refreshToken
	};
}

export async function verifyToken(token: string, secret: string): Promise<TokenDto> {
	return new Promise((resolve, reject) => {
		verify(token, secret, (err, decoded) => {
			if (err) {
				return reject(err);
			}
			resolve(decoded as TokenDto);
		});
	});
}