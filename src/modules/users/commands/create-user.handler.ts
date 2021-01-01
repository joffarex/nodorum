import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { Guard, Result } from '../../../shared/core';
import { User } from '../../../domain/user-aggregate';
import { UserMapper } from '../mappers';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
    private readonly _publisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<string> | Result<void>> {
    const foundUserByUsername = await this._userRepository.findOne({ username: command.username });
    if (foundUserByUsername) {
      return Result.fail(`User with username: ${command.username} already exists`);
    }

    const foundUserByEmail = await this._userRepository.findOne({ email: command.email });
    if (foundUserByEmail) {
      return Result.fail(`User with email: ${command.email} already exists`);
    }

    // TODO: hash password
    const user = this._publisher.mergeObjectContext(User.create(command.username, command.email, command.password));

    const userEntity = this._userMapper.domainToEntity(user);

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
