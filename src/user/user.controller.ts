import { Controller, Get, Param, Body, Put, Delete, UseGuards, Post } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { UserBody, FollowersBody } from './interfaces/user.interface';
import { updateSchema } from './validator';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { AuthGuard } from '../shared/guards/auth.guard';
import { User } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/app.logger';

@Controller('user')
export class UserController {
  private logger = new AppLogger('UserController');

  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  async me(@User() user: JwtPayload): Promise<UserBody> {
    return this.userService.findOne(user.id);
  }

  @Get('/:userId')
  async findOne(@Param('userId') userId: number): Promise<UserBody> {
    const userBody = await this.userService.findOne(userId);
    this.logger.debug(`[findOne] user with id: ${userBody.user.id} found`);

    return userBody;
  }

  @Put('/update')
  @UseGuards(AuthGuard)
  async update(
    @Body(new JoiValidationPipe(updateSchema)) updateUserDto: UpdateUserDto,
    @User() user: JwtPayload,
  ): Promise<UserBody> {
    const userBody = await this.userService.update(user.id, updateUserDto);
    this.logger.debug(`[update] user with id: ${userBody.user.id} updated`);

    return userBody;
  }

  @Delete('/delete')
  @UseGuards(AuthGuard)
  async delete(@User() user: JwtPayload): Promise<{ message: string }> {
    const res = await this.userService.delete(user.id);
    this.logger.debug(`[delete] user with id: ${user.id} deleted`);

    return res;
  }

  @Get('/email/:email')
  async findOneByEmail(@Param('email') email: string): Promise<UserBody> {
    const userBody = await this.userService.findOneByEmail(email);
    this.logger.debug(`[findOneByEmail] user with email: ${userBody.user.email} found`);

    return userBody;
  }

  @Get('/username/:username')
  async findOneByUsername(@Param('username') username: string): Promise<UserBody> {
    const userBody = await this.userService.findOneByUsername(username);
    this.logger.debug(`[findOneByUsername] user with username: ${userBody.user.username} found`);

    return userBody;
  }

  @Post('/follow/:userToFollowId')
  async followAction(
    @Param('userToFollowId') userToFollowId: number,
    @User() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.userService.followAction(user.id, userToFollowId);
  }

  @Get('/followers/:userId')
  async getFollowers(@Param(':userId') userId: number): Promise<FollowersBody> {
    return this.userService.getFollowers(userId);
  }
}
