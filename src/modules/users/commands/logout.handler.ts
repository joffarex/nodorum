import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';
import { IAuthService } from '../services';
import { Result } from '../../../shared/core';
import { User, UserPassword } from '../../../domain/user-aggregate';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
    private readonly _publisher: EventPublisher,
    private readonly _authService: IAuthService,
  ) {}

  async execute(command: LogoutCommand): Promise<any> {
    const foundUser = await this._userRepository.findOne({ id: command.id });
    if (!foundUser) {
      return Result.fail<void>(`User with id: ${command.id} not found`);
    }

    const userPassword = (await UserPassword.create(foundUser.password, true)).value;

    const user = this._publisher.mergeObjectContext(
      User.createWithId(foundUser.id, foundUser.username, foundUser.email, userPassword),
    );

    await this._authService.deAuthenticateUser(user.username);

    return Result.ok<void>();
  }
}
