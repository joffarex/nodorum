import { Controller, Post, Body, Query } from '@nestjs/common';
import { JoiValidationPipe } from '../shared/pipes';
import { Rcid } from '../shared/decorators';
import { logFormat, MessageResponse } from '../shared';
import { AppLogger } from '../app.logger';
import { forgotPasswordSchema, resetPasswordSchema } from './validator';
import { ForgotPasswordDto, ResetPasswordDto, QueryDto } from './dto';
import { PasswordResetService } from './password-reset.service';

@Controller('password')
export class PasswordResetController {
  private logger = new AppLogger('PasswordResetController');

  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('/email')
  async forgotPassword(
    @Body(new JoiValidationPipe(forgotPasswordSchema)) forgotPasswordDto: ForgotPasswordDto,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.passwordResetService.forgotPassword(forgotPasswordDto);
    this.logger.debug(logFormat(rcid, 'forgotPassword', res.message, forgotPasswordDto, null));

    return res;
  }

  @Post('/reset')
  async resetPassword(
    @Query() query: QueryDto,
    @Body(new JoiValidationPipe(resetPasswordSchema)) resetPasswordDto: ResetPasswordDto,
    @Rcid() rcid: string,
  ): Promise<MessageResponse> {
    const res = await this.passwordResetService.resetPassword(query, resetPasswordDto);
    this.logger.debug(logFormat(rcid, 'resetPassword', res.message, resetPasswordDto, null));

    return res;
  }
}
