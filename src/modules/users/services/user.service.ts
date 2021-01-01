import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../../shared/core';
import { IUserService } from './user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly _logger = new AppLogger('UserService');
}
