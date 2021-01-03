import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';
import { Result } from '../../../shared/core';
import { JWTToken, RefreshToken, User, UserPassword } from '../../../domain/user-aggregate';
import { IAuthService } from '../services';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
    private readonly _publisher: EventPublisher,
    private readonly _authService: IAuthService,
  ) {}

  async execute(command: LoginCommand): Promise<Result<void> | Result<any>> {
    const foundUser = await this._userRepository.findOne({ username: command.username });
    if (!foundUser) {
      return Result.fail<void>('Incorrect credentials');
    }

    const userPassword = (await UserPassword.create(foundUser.password, true)).value;

    const user = this._publisher.mergeObjectContext(
      User.createWithId(foundUser.id, foundUser.username, foundUser.email, userPassword),
    );

    const isPasswordValid = await userPassword.compare(command.password);
    if (!isPasswordValid) {
      return Result.fail<void>('Incorrect credentials');
    }

    const accessToken: JWTToken = this._authService.signJWT({
      userId: user.userId,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      email: user.email,
    });
    const refreshToken: RefreshToken = this._authService.createRefreshToken();

    user.setAccessToken(accessToken, refreshToken);

    await this._authService.saveAuthenticatedUser(user);

    return Result.ok({ accessToken, refreshToken });
  }
}
