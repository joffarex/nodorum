import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RefreshAccessTokenCommand } from './refresh-access-token.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';
import { IAuthService } from '../services';
import { Result } from '../../../shared/core';
import { JWTToken, User, UserPassword } from '../../../domain/user-aggregate';

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler implements ICommandHandler<RefreshAccessTokenCommand> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
    private readonly _publisher: EventPublisher,
    private readonly _authService: IAuthService,
  ) {}

  async execute(command: RefreshAccessTokenCommand): Promise<Result<JWTToken> | Result<void>> {
    const username = await this._authService.getUsernameFromRefreshToken(command.refreshToken);

    const foundUser = await this._userRepository.findOne({ username });
    if (!foundUser) {
      return Result.fail<void>(`User with username: ${username} not found`);
    }

    const userPassword = (await UserPassword.create(foundUser.password, true)).value;

    const user = this._publisher.mergeObjectContext(
      User.createWithId(foundUser.id, foundUser.username, foundUser.email, userPassword),
    );

    const accessToken: JWTToken = this._authService.signJWT({
      userId: user.userId,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      email: user.email,
    });

    user.setAccessToken(accessToken, command.refreshToken);

    return Result.ok(accessToken);
  }
}
