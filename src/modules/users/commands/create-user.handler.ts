import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { Guard, Result } from '../../../shared/core';
import { User, UserPassword } from '../../../domain/user-aggregate';
import { UserMapper } from '../mappers';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
    private readonly _publisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<void>> {
    const foundUserByUsername = await this._userRepository.findOne({ username: command.username });
    if (foundUserByUsername) {
      return Result.fail<void>(`User with username: ${command.username} already exists`);
    }

    const foundUserByEmail = await this._userRepository.findOne({ email: command.email });
    if (foundUserByEmail) {
      return Result.fail<void>(`User with email: ${command.email} already exists`);
    }

    const userPassword = await UserPassword.create(command.password);

    const user = this._publisher.mergeObjectContext(User.create(command.username, command.email, userPassword.value));

    const userEntity = await this._userMapper.domainToEntity(user);

    try {
      await this._userRepository.save(userEntity);
      user.commit();
    } catch (err) {
      // TODO: turn into Result.fail
      Guard.isDatabaseDuplicate(err, ['Username', 'Email']);
    }

    return Result.ok<void>();
  }
}
