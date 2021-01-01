import { Controller, Inject } from '@nestjs/common';
import { AppLogger } from '../../shared/core';
import { IUserService, USER_SERVICE } from './services';

@Controller('user')
export class UserController {
  private readonly _logger = new AppLogger('UserController');

  constructor(@Inject(USER_SERVICE) private readonly _userService: IUserService) {}
}
