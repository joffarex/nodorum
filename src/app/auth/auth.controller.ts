import {Body, Controller, HttpCode, Post} from '@nestjs/common';
import {config} from '../../config';
import {AppLogger} from '../app.logger';
import {UserEntity} from '../user/entity';
import {UserService} from '../user/user.service';
import {CredentialsDto} from './dto/credentials.dto';
import {JwtDto} from './dto/jwt.dto';
import {RefreshTokenDto} from './dto/refresh-token.dto';
import {createAuthToken, verifyToken} from './jwt';


@Controller('auth')
export class AuthController {

	private logger = new AppLogger();

	constructor(
		private readonly userService: UserService
	) {

	}

	@Post('login')
	@HttpCode(200)
	public async login(@Body() credentials: CredentialsDto): Promise<JwtDto> {
		const user = await this.userService.login(credentials);
		this.logger.debug(`[login] User ${credentials.email} logging`);
		return createAuthToken(user);
	}

    // TODO: deeppartial
	@Post('register')
	@HttpCode(204)
	public async register(@Body() data: UserEntity): Promise<void> {
		const user = await this.userService.create(data);
		this.logger.debug(`[register] User ${user.email} register`);
		this.logger.debug(`[register] Send registration email for email ${user.email}`);
	}
  
	@Post('refresh')
	@HttpCode(200)
	public async refreshToken(@Body() body: RefreshTokenDto): Promise<JwtDto> {
		this.logger.debug(`[refresh] Token ${body.refreshToken}`);
		const token = await verifyToken(body.refreshToken, config.session.refresh.secret);
		return await createAuthToken({id: token.id});
	}
}