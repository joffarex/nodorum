import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../../domain/user-aggregate/events';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    // TODO: maybe send email to user
  }
}
