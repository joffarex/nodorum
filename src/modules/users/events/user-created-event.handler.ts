import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../../domain/user-aggregate/events';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';
import { Guard } from '../../../shared/core';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    const userEntity = this._userMapper.domainToEntity(event.user);

    try {
      await this._userRepository.save(userEntity);
    } catch (err) {
      Guard.isDatabaseDuplicate(err, ['Username', 'Email']);
    }
  }
}
