import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { UserDeletedEvent } from '../../../domain/user-aggregate/events';
import { delay, map } from 'rxjs/operators';

@Injectable()
export class UserSagas {
  @Saga()
  public userDeleted = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserDeletedEvent),
      delay(1000),
      map((event) => {
        console.log('After UserDeletedEvent');
        return {} as ICommand; // TODO: replace with real event
      }),
    );
  };
}
