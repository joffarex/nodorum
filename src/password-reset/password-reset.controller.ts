import { Controller, Post, Body, Query } from '@nestjs/common';
import { AppLogger } from 'src/app.logger';
import { PasswordResetService } from './password-reset.service';
import { forgotPasswordSchema, resetPasswordSchema } from './validator';
import { ForgotPasswordDto, ResetPasswordDto, QueryDto } from './dto';
import { Rcid } from 'src/shared/decorators/rcid.decorator';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { logFormat, MessageResponse } from 'src/shared';

@Controller('password')
export class PasswordResetController {
  private logger = new AppLogger('PasswordResetController');

  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('/email')
  async forgotPassword(@Body(new JoiValidationPipe(forgotPasswordSchema)) forgotPasswordDto: ForgotPasswordDto, @Rcid() rcid: string ): Promise<MessageResponse> {
    const res = await this.passwordResetService.forgotPassword(forgotPasswordDto)
    this.logger.debug(logFormat(rcid, 'forgotPassword', res.message, forgotPasswordDto, null));

    return res;
  }

  @Post('/reset')
  async resetPassword(@Query() query: QueryDto, @Body(new JoiValidationPipe(resetPasswordSchema)) resetPasswordDto: ResetPasswordDto, @Rcid() rcid: string): Promise<MessageResponse>  {
   const res =   await this.passwordResetService.resetPassword(query, resetPasswordDto)
   this.logger.debug(logFormat(rcid, 'resetPassword', res.message, resetPasswordDto, null));

   return res;
  }
}
