import { Controller, Get, Param, Post, Body, Put, Delete, UsePipes } from '@nestjs/common';
import {LogoutUserDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { UserBody } from './interfaces/user.interface';
import { updateSchema } from './validator';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async me(): Promise<UserBody> {
    // will get user id from token, currently hard-coded
    return this.userService.findOne(1);
  }

  @Get('/:id')
  // @Roles('user')
  async findOne(@Param('id') id: number): Promise<UserBody> {
    return this.userService.findOne(id); // possibly decode from base64
  }

  // only implemented after auth has been implemented
  @Post('/logout')
  async logout(@Body() logoutUserDto: LogoutUserDto): Promise<LogoutUserDto> {
    return logoutUserDto;
  }

  @Put('/update')
  @UsePipes(new JoiValidationPipe(updateSchema))
  async update(@Body() updateUserDto: UpdateUserDto): Promise<UserBody> {
    // id is currently hard-coded
    // that is because authentication system is not built yet.
    // after that, id will be fetched from token
    return this.userService.update(1, updateUserDto);
  }

  @Delete('/delete')
  async delete(): Promise<{ message: string }> {
    return this.userService.delete(1);
  }
}
