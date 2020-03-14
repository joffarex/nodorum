import { Controller, Get, Param, Body, Put, Delete, UseGuards, Post, Query } from '@nestjs/common';
import { UpdateUserDto, SendEmailDto, QueryDto } from './dto';
import { UserService } from './user.service';
import { UserBody, FollowersBody } from './interfaces/user.interface';
import { updateSchema, sendEmailSchema } from './validator';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { AuthGuard } from '../shared/guards/auth.guard';
import { User, ReqUrl, Rcid } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/app.logger';
import { logFormat, MessageResponse } from 'src/shared';

@Controller('user')
export class UserController {
  private logger = new AppLogger('UserController');

  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  async me(@User() user: JwtPayload, @Rcid() rcid: string): Promise<UserBody> {
    const userBody = await this.userService.findOne(user.id);
    this.logger.debug(logFormat(rcid, 'me', '', {}, user));

    return userBody;
  }

  @Get('/:userId')
  async findOne(@Param('userId') userId: number, @Rcid() rcid: string): Promise<UserBody> {
    const userBody = await this.userService.findOne(userId);
    this.logger.debug(logFormat(rcid, 'findOne', `user with id: ${userBody.user.id} found`, {}, null));

    return userBody;
  }

  @Post('/email/verify')
  async verifyEmail(@Query() query: QueryDto, @ReqUrl() url: string, @Rcid() rcid: string): Promise<MessageResponse> {
    const res = await this.userService.verifyEmail(query, url);
    this.logger.debug(logFormat(rcid, 'verify', res.message, {}, null));

    return res;
  }

  @Post('/email/send')
  async sendEmail(@Body(new JoiValidationPipe(sendEmailSchema)) sendEmailDto: SendEmailDto, @Rcid() rcid: string) {
    const res = await this.userService.sendEmail(sendEmailDto);
    this.logger.debug(logFormat(rcid, 'verify', res.message, sendEmailDto, null));

    return res;
  }

  @Put('/update')
  @UseGuards(AuthGuard)
  async update(
    @Body(new JoiValidationPipe(updateSchema)) updateUserDto: UpdateUserDto,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<UserBody> {
    const userBody = await this.userService.update(user.id, updateUserDto);
    this.logger.debug(logFormat(rcid, 'update', `user with id: ${userBody.user.id} updated`, updateUserDto, user));

    return userBody;
  }

  @Delete('/delete')
  @UseGuards(AuthGuard)
  async delete(@User() user: JwtPayload, @Rcid() rcid: string): Promise<MessageResponse> {
    const res = await this.userService.delete(user.id);
    this.logger.debug(logFormat(rcid, 'delete', `user with id: ${user.id} deleted`, {}, user));

    return res;
  }

  @Get('/email/:email')
  async findOneByEmail(@Param('email') email: string, @Rcid() rcid: string): Promise<UserBody> {
    const userBody = await this.userService.findOneByEmail(email);
    this.logger.debug(logFormat(rcid, 'findOneByEmail', `user with email: ${userBody.user.email} found`, {}, null));

    return userBody;
  }

  @Get('/username/:username')
  async findOneByUsername(@Param('username') username: string, @Rcid() rcid: string): Promise<UserBody> {
    const userBody = await this.userService.findOneByUsername(username);
    this.logger.debug(
      logFormat(rcid, 'findOneByUsername', `user with username: ${userBody.user.username} found`, {}, null),
    );

    return userBody;
  }

  @Post('/follow/:userToFollowId')
  async followAction(
    @Param('userToFollowId') userToFollowId: number,
    @User() user: JwtPayload,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.userService.followAction(user.id, userToFollowId);
    this.logger.debug(
      logFormat(rcid, 'followAction', `${res} (userId: ${user.id} - userToFollowId: ${userToFollowId})`, {}, user),
    );

    return res;
  }

  @Get('/followers/:userId')
  async getFollowers(@Param(':userId') userId: number, @Rcid() rcid: string): Promise<FollowersBody> {
    const followersBody = await this.userService.getFollowers(userId);
    this.logger.debug(logFormat(rcid, 'getFollowers', `get followers for user id: ${userId}`, {}, null));

    return followersBody;
  }
}
