import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { PasswordResetEntity } from './password-reset.entity';
import { hash } from 'argon2';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { ForgotPasswordDto, ResetPasswordDto, QueryDto } from './dto';
import { MessageResponse } from 'src/shared';

@Injectable()
export class PasswordResetService {
  constructor(@Inject(UserEntity) private readonly userRepository: Repository<UserEntity>,
  @Inject(PasswordResetEntity) private readonly passwordResetRepository: Repository<PasswordResetEntity>,
  private readonly configService: ConfigService,

  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponse> {
    const {email} = forgotPasswordDto;
    
    const user = await this.userRepository.findOne({email})

    if(!user) {
      throw new NotFoundException('User not found')
    }

    const token = this.plaintextToken();

    const reset = new PasswordResetEntity();
    reset.user = user;
    reset.token = this.hashedToken(token);

    const savedReset = await this.passwordResetRepository.save(reset);

    // TODO: send email
    console.log({
      to: email,
      subject: 'Reset your password',
      text: this.url(savedReset.id, token)
    })

    return {message: `Email sent to ${user.email}`}
  }

  async resetPassword(query: QueryDto, resetPasswordDto: ResetPasswordDto) {
    const {id, token} = query
    const {password} = resetPasswordDto;

    const reset = await this.passwordResetRepository.findOne(id)
    let user: UserEntity | undefined;

    if(!reset || !this.isResetValid(token, reset) || 
    !(user = await this.userRepository.findOne(reset.user.id))) {
      throw new BadRequestException('Invalid password reset token')
    }

    const [res] = await Promise.all(
      [
        this.resetUserPassword(user.id, password),
        this.passwordResetRepository.createQueryBuilder('passwordreset').where('"passwordreset"."userId" = :userId', {userId: reset.user.id}).delete()
      ]
    )

    // TODO: send mail
      console.log({
        to: user.email,
        subject: 'Password reset',
        text: 'Your password was successfully reset'
      })

    return {message: res.message }

  }

  async resetUserPassword(userId: number, password: string): Promise<MessageResponse> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :userId', { userId })
      .andWhere('users.deletedAt IS NULL')
      .addSelect('users.password')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await hash(password);

await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  private plaintextToken(): string {
    return randomBytes(32).toString('hex');
  }

  private url(resetId: number, plaintextToken: string): string {
    const host = this.configService.get<string>('host');
    return `${host}/password/reset?id=${resetId}&token=${plaintextToken}`
  }

  private hashedToken(plaintextToken: string): string {
    return createHmac('sha256', 'secret').update(plaintextToken).digest('hex')
  }

  private isResetValid(plaintextToken: string, reset: PasswordResetEntity): boolean {
    const hash = this.hashedToken(plaintextToken);

    const {token, expiredAt} = reset;
    
    return timingSafeEqual(Buffer.from(hash), Buffer.from(token)) && 
      expiredAt > DateTime.local().toString();
  }
}
