import { DomainEvent } from '../../seed-work';

export class UserLoggedInEvent extends DomainEvent {
  constructor(public readonly userId: string) {
    super(new Date());
  }
}
