import { CreateUserHandler } from './create-user.handler';
import { DeleteUserHandler } from './delete-user.handler';

export * from './create-user.command';
export * from './delete-user.command';

export const CommandHandlers = [CreateUserHandler, DeleteUserHandler];
