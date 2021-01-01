import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Res } from '@nestjs/common';
import { AppLogger, Result } from '../../shared/core';
import { IUserService, USER_SERVICE } from './services';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dtos';
import { CreateUserCommand, DeleteUserCommand } from './commands';
import { GetUserByUsernameQuery } from './queries';
import { User } from '../../domain/user-aggregate';
import { FastifyReply } from 'fastify';

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

  @Delete()
  @HttpCode(204)
  async deleteUser(): Promise<void> {
    // TODO: inject authenticated user ID in command
    await this._commandBus.execute(new DeleteUserCommand('TODO'));
  }

  @Get(':username')
  async findOneByUsername(@Param('username') username: string, @Res() res: FastifyReply) {
    const result = (await this._queryBus.execute(new GetUserByUsernameQuery(username))) as
      | Result<User>
      | Result<string>;

    if (result.isFailure) {
      const error = result.value;

      return res.status(404).send({ error });
    }

    if (result.isSuccess) {
      return res.status(200).send({ data: result.value });
    }
  }
}
