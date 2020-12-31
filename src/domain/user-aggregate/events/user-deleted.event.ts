import { DomainEvent } from '../../seed-work';

export class UserDeletedEvent extends DomainEvent {
  constructor(public readonly userId: string) {
    super(new Date());
  }
}
