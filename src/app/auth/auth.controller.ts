import {Body, Controller, HttpCode, Post, UsePipes, ForbiddenException} from '@nestjs/common';
import {AppLogger} from '../app.logger';
import {UserService} from '../user/user.service';
import {JwtDto} from './dto/jwt.dto';
import {RefreshTokenDto} from './dto/refresh-token.dto';
import { UserBody } from '../user/interfaces/user.interface';
import { RegisterUserDto, LoginUserDto } from '../user/dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { registerSchema, loginSchema } from './validator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {

	private logger = new AppLogger('AuthController');

	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService
	) {

	}

	@Post('login')
	@HttpCode(200)
	@UsePipes(new JoiValidationPipe(loginSchema))
	public async login(@Body() loginUserDto: LoginUserDto): Promise<JwtDto> {
		const {user} = await this.userService.login(loginUserDto);
		this.logger.debug(`[login] User ${user.username} logging`);

		const payload: JwtPayload = {
			id: user.id,
			email: user.email,
			username: user.username
		}

		const accessToken = this.authService.getAccessToken(payload);
		const refreshToken = this.authService.getRefreshToken(payload);

		return {
			user,
			accessToken,
			refreshToken,
		}
	}

	@Post('register')
	@HttpCode(201)
	@UsePipes(new JoiValidationPipe(registerSchema))
	public async register(@Body() registerUserDto: RegisterUserDto): Promise<UserBody> {
		const {user} = await this.userService.register(registerUserDto);
		this.logger.debug(`[register] User ${user.username} register`);
		// TODO: implement emails
		this.logger.debug(`[register] Send registration email for email ${user.email}`);
		return {user}
	}
  
	@Post('refresh-token')
	@HttpCode(200)
	public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<JwtDto> {
		const {refreshToken} = refreshTokenDto
		this.logger.debug(`[refresh] Token ${refreshToken}`);
		if(!refreshToken) {
			throw new ForbiddenException();
		}

		const newTokens = await this.authService.refreshToken(refreshToken);

		return newTokens;
	}
}