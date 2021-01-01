import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { AppLogger, Result } from '../../shared/core';
import { IUserService, USER_SERVICE } from './services';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dtos';
import { CreateUserCommand } from './commands';

@Controller('user')
export class UserController {
  private readonly _logger = new AppLogger('UserController');

  constructor(
    @Inject(USER_SERVICE) private readonly _userService: IUserService,
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus,
  ) {}

  @Post('create')
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this._commandBus.execute(
      new CreateUserCommand(createUserDto.username, createUserDto.email, createUserDto.password),
    );
  }
}
