import { v1 as uuidv1 } from 'uuid';
import { Body, Controller, ForbiddenException, HttpCode, Post } from '@nestjs/common';
import { JoiValidationPipe } from 'src/shared/pipes';
import { Rcid } from 'src/shared/decorators';
import { logFormat } from 'src/shared';
import { AppLogger } from '../app.logger';
import { loginSchema, registerSchema } from './validator';
import { JwtDto, RefreshTokenDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserBody } from '../user/interfaces/user.interface';
import { LoginUserDto, RegisterUserDto } from '../user/dto';

@Controller('auth')
export class AuthController {
  private logger = new AppLogger('AuthController');

  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  public async login(
    @Body(new JoiValidationPipe(loginSchema)) loginUserDto: LoginUserDto,
    @Rcid() rcid: string,
  ): Promise<JwtDto> {
    const { user } = await this.userService.login(loginUserDto);
    this.logger.debug(logFormat(rcid, 'login', `user (${user.username}:${user.email})`, loginUserDto, null));

    const payload: JwtPayload = {
      tokenId: uuidv1(),
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.authService.getAccessToken(payload);
    const refreshToken = await this.authService.getRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('register')
  @HttpCode(201)
  public async register(
    @Body(new JoiValidationPipe(registerSchema)) registerUserDto: RegisterUserDto,
    @Rcid() rcid: string,
  ): Promise<UserBody> {
    const { user } = await this.userService.register(registerUserDto, { rcid, user: null });
    this.logger.debug(
      logFormat(rcid, 'register', `user ${user.username}:${user.email} registering`, registerUserDto, null),
    );

    return { user };
  }

  @Post('refresh-token')
  @HttpCode(200)
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Rcid() rcid: string): Promise<JwtDto> {
    const { refreshToken } = refreshTokenDto;
    this.logger.debug(logFormat(rcid, 'refresh', `token ${refreshToken}`, refreshTokenDto, null));

    if (!refreshToken) {
      throw new ForbiddenException();
    }

    return this.authService.refreshToken(refreshToken);
  }
}
