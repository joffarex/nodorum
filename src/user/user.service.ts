import { Repository, IsNull } from 'typeorm';
import { hash, verify } from 'argon2';
import { DateTime } from 'luxon';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { S3_TOKEN } from '../aws/s3';
import S3 from 'aws-sdk/clients/s3';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nest-modules/mailer';
import { MessageResponse } from '../shared';
import { RegisterUserDto, UpdateUserDto, LoginUserDto, SendEmailDto, QueryDto } from './dto';
import { UserBody, FollowersBody } from './interfaces/user.interface';
import { UserEntity } from './user.entity';
import { FollowerEntity } from './follower.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowerEntity) private readonly followerRepository: Repository<FollowerEntity>,
    @Inject(S3_TOKEN) private readonly s3Client: S3,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<UserBody> {
    const { username, email, password, displayName, profileImage, bio } = registerUserDto;
    // check if username and email are unique
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.username = :username', { username })
      .orWhere('users.email = :email', { email })
      .getOne();

    if (user) {
      throw new BadRequestException('Email or Username is already taken', 'Validation failed');
    }

    // create new user
    const newUser = new UserEntity();
    newUser.username = username;
    newUser.email = email;
    // hash password
    newUser.password = await hash(password);
    // optional fields
    if (displayName) newUser.displayName = displayName;
    if (profileImage) newUser.profileImage = await this.uploadProfileImage(profileImage, username);
    if (bio) newUser.bio = bio;

    // return saved user
    const savedUser = await this.userRepository.save(newUser);
    return { user: savedUser };
  }

  async login(loginUserDto: LoginUserDto): Promise<UserBody> {
    const { username, password } = loginUserDto;

    // find if user exists
    const qb = await this.userRepository
      .createQueryBuilder('users')
      .where('users.username = :username', { username })
      .andWhere('users.deletedAt IS NULL');

    const user = await qb.getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userWithPassword = await qb.addSelect('users.password').getOne();

    // check if passwords match
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const match = await verify(userWithPassword!.password!, password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { user };
  }

  async findOne(id: number): Promise<UserBody> {
    const user = await this.userRepository.findOne({ id, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  async findOneByEmail(email: string): Promise<UserBody> {
    const user = await this.userRepository.findOne({ email, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  async findOneByUsername(username: string): Promise<UserBody> {
    const user = await this.userRepository.findOne({ username, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserBody> {
    const { displayName, profileImage, bio } = dto;
    // ensure that user exists
    const user = await this.userRepository.findOne({ id, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (displayName) user.displayName = displayName;
    if (profileImage) user.profileImage = profileImage;
    if (bio) user.bio = bio;

    const updatedUser = await this.userRepository.save(user);
    return { user: updatedUser };
  }

  async delete(id: number): Promise<MessageResponse> {
    // ensure that user exists
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.deletedAt = DateTime.local();
    user.displayName = '[DELETED]';
    user.username = '[DELETED]';
    user.email = '[DELETED]';
    user.displayName = 'pictures/blank-profile-picture-S4P3RS3CR3T';

    await this.userRepository.save(user);

    return { message: 'User successfully removed' };
  }

  async followAction(userId: number, userToFollowId: number): Promise<MessageResponse> {
    const user = await this.userRepository.findOne({ id: userId, deletedAt: IsNull() });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userToFollow = await this.userRepository.findOne({ id: userToFollowId, deletedAt: IsNull() });

    if (!userToFollow) {
      throw new NotFoundException('User who you are trying to follow does not exist');
    }

    const isFollowing = await this.followerRepository.findOne({ userId: userToFollowId, followerId: userId });

    if (isFollowing) {
      const { affected } = await this.followerRepository.delete(isFollowing.id);

      if (affected !== 1) {
        throw new InternalServerErrorException('Database error');
      }

      return { message: 'User unfollowed' };
    } else {
      const follower = new FollowerEntity();
      follower.userId = userToFollowId;
      follower.followerId = userId;

      await this.followerRepository.save(follower);
      return { message: 'User followed' };
    }
  }

  async getFollowers(userId: number): Promise<FollowersBody> {
    const user = await this.userRepository.findOne({ id: userId, deletedAt: IsNull() });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const qb = this.followerRepository.createQueryBuilder('followers').leftJoinAndSelect('followers.userId', 'user');

    const followers = await qb.getMany();

    const followersCount = await qb.getCount();

    return {
      followers,
      followersCount,
    };
  }

  async verifyEmail(query: QueryDto, url: string): Promise<MessageResponse> {
    const { id } = query;

    const user = await this.userRepository
      .createQueryBuilder('users')
      .addSelect('verifiedAt')
      .where('users.id = :id', { id })
      .getOne();

    if (!user || !this.hasValidVerificationUrl(url, query)) {
      throw new BadRequestException('Invalid activation link');
    }

    if (user.verifiedAt && user.status === 'VERIFIED') {
      throw new BadRequestException('Email already verified');
    }

    await this.markAsVerified(user.id);

    return { message: 'Email verified successfully' };
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { email } = sendEmailDto;

    const user = await this.userRepository.findOne({ email, deletedAt: IsNull() });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verifiedAt && user.status === 'VERIFIED') {
      throw new BadRequestException('Email already verified');
    }

    const link = this.verificationUrl(user);

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email address',
      text: link,
    });

    return { message: `Email sent to ${user.email}` };
  }

  private async markAsVerified(userId: number): Promise<UserBody> {
    const user = await this.userRepository.findOne({ id: userId, deletedAt: IsNull() });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'VERIFIED';
    user.verifiedAt = DateTime.local();

    const verifiedUser = await this.userRepository.save(user);

    return { user: verifiedUser };
  }

  private async uploadProfileImage(profileImage: string, username: string): Promise<string> {
    const base64 = Buffer.from(profileImage.replace(/^body:image\/\w+;base64,/, ''), 'base64');

    const bucketName = this.configService.get<string>('aws.s3BucketName');

    if (!bucketName) {
      throw new InternalServerErrorException();
    }

    const { Key } = await this.s3Client
      .upload({
        Bucket: bucketName,
        Key: `pictures/user/${username}.png`,
        Body: base64,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/png`,
      })
      .promise();

    return Key;
  }

  private signVerificationUrl(url: string): string {
    return createHmac('sha256', 'secret')
      .update(url)
      .digest('hex');
  }

  private verificationUrl(user: UserEntity): string {
    const { id, email } = user;
    const token = createHash('sha1')
      .update(email)
      .digest('hex');
    const expires = DateTime.local().plus({ minutes: 15 });

    const host = this.configService.get<string>('host');
    const url = `${host}//email/verify?id=${id}&token=${token}&expires=${expires}`;
    const signature = this.signVerificationUrl(url);

    return `${url}&signature=${signature}`;
  }

  private hasValidVerificationUrl(path: string, query: any): boolean {
    const host = this.configService.get<string>('host');
    const url = `${host}${path}`;
    const original = url.slice(0, url.lastIndexOf('&'));
    const signature = this.signVerificationUrl(original);

    return (
      timingSafeEqual(Buffer.from(signature), Buffer.from(query.signature)) &&
      query.expires > DateTime.local().toString()
    );
  }
}
