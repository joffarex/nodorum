import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from './delete-user.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';
import { Result } from '../../../shared/core';
import { User, UserPassword } from '../../../domain/user-aggregate';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
    private readonly _publisher: EventPublisher,
  ) {}

  async execute(command: DeleteUserCommand): Promise<Result<void>> {
    const foundUser = await this._userRepository.findOne({ id: command.id });
    if (!foundUser) {
      return Result.fail<void>(`User with id: ${command.id} not found`);
    }

    const userPassword = await UserPassword.create(foundUser.password, true);

    const user = this._publisher.mergeObjectContext(
      User.createWithId(foundUser.id, foundUser.username, foundUser.email, userPassword.value),
    );
    user.delete();

    const userEntity = this._userMapper.domainToEntity(user);

    try {
      await this._userRepository.save(userEntity);
      user.commit();
    } catch (err) {
      // TODO: handle unexpected errors
    }

    return Result.ok<void>();
  }
}
