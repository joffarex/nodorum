import { Controller, Get, Param, Body, Put, Delete, UsePipes, UseGuards, Scope, Inject } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { UserBody } from './interfaces/user.interface';
import { updateSchema } from './validator';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { AuthGuard } from '../shared/guards/auth.guard';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

@Controller({
  path: 'user',
  scope: Scope.REQUEST,
})
export class UserController {
  constructor(@Inject(REQUEST) private readonly request: FastifyRequest, private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  async me(): Promise<UserBody> {
    return this.userService.findOne(this.request.user.id);
  }

  @Get('/:id')
  // @Roles('user')
  async findOne(@Param('id') id: number): Promise<UserBody> {
    return this.userService.findOne(id);
  }

  @Put('/update')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateSchema))
  async update(@Body() updateUserDto: UpdateUserDto): Promise<UserBody> {
    return this.userService.update(this.request.user.id, updateUserDto);
  }

  @Delete('/delete')
  @UseGuards(AuthGuard)
  async delete(): Promise<{ message: string }> {
    return this.userService.delete(this.request.user.id);
  }
}
