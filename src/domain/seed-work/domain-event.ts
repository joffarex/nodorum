import { IEvent } from '@nestjs/cqrs';

export interface IDomainEvent {
  dateTime: Date;
}

export abstract class DomainEvent implements IDomainEvent, IEvent {
  protected constructor(public readonly dateTime: Date) {}
}
