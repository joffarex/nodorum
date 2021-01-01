import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserDeletedEvent } from '../../../domain/user-aggregate/events';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';

@EventsHandler(UserDeletedEvent)
export class UserDeletedEventHandler implements IEventHandler<UserDeletedEvent> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
  ) {}

  async handle(event: UserDeletedEvent): Promise<void> {
    // TODO: maybe send email to user with info that they can get back their user
  }
}
