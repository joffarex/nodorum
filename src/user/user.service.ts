import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserBody, FollowersBody } from './interfaces/user.interface';
import { RegisterUserDto, UpdateUserDto, LoginUserDto } from './dto';
import { UserEntity } from './user.entity';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, verify } from 'argon2';
import { AppLogger } from '../app.logger';
import { FollowerEntity } from './follower.entity';
import { DateTime } from 'luxon';

@Injectable()
export class UserService {
  private logger = new AppLogger('UserService');

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowerEntity) private readonly followerRepository: Repository<FollowerEntity>,
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
    if (profileImage) newUser.profileImage = profileImage; // TODO: upload image to s3
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
      throw new NotFoundException();
    }
    return { user };
  }

  async findOneByEmail(email: string): Promise<UserBody> {
    const user = await this.userRepository.findOne({ email, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException();
    }
    return { user };
  }

  async findOneByUsername(username: string): Promise<UserBody> {
    const user = await this.userRepository.findOne({ username, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException();
    }
    return { user };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserBody> {
    const { displayName, profileImage, bio } = dto;
    // ensure that user exists
    const user = await this.userRepository.findOne({ id, deletedAt: IsNull() });
    if (!user) {
      throw new NotFoundException();
    }

    if (displayName) user.displayName = displayName;
    if (profileImage) user.profileImage = profileImage;
    if (bio) user.bio = bio;

    const updatedUser = await this.userRepository.save(user);
    return { user: updatedUser };
  }

  async delete(id: number): Promise<{ message: string }> {
    // ensure that user exists
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    // TODO: move deleted user in separate table

    user.deletedAt = DateTime.local();
    user.displayName = '[DELETED]';
    user.username = '[DELETED]';
    user.email = '[DELETED]';
    user.displayName = 'pictures/blank-profile-picture-S4P3RS3CR3T';

    await this.userRepository.save(user);

    return { message: 'User successfully removed.' };
  }

  async followAction(userId: number, userToFollowId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ id: userId, deletedAt: IsNull() });

    if (!user) {
      throw new NotFoundException();
    }

    const userToFollow = await this.userRepository.findOne({ id: userToFollowId, deletedAt: IsNull() });

    if (!userToFollow) {
      throw new NotFoundException();
    }

    const isFollowing = await this.followerRepository.findOne({ userId: userToFollowId, followerId: userId });

    if (isFollowing) {
      const { affected } = await this.followerRepository.delete(isFollowing.id);

      if (affected !== 1) {
        throw new InternalServerErrorException();
      }

      return { message: 'User unfollowed.' };
    } else {
      const follower = new FollowerEntity();
      follower.userId = userToFollowId;
      follower.followerId = userId;

      const newFollower = await this.followerRepository.save(follower);
      console.log(newFollower);

      return { message: 'User follower.' };
    }
  }

  async getFollowers(userId: number): Promise<FollowersBody> {
    const user = await this.userRepository.findOne({ id: userId, deletedAt: IsNull() });

    if (!user) {
      throw new NotFoundException();
    }

    // TODO: experimental, subject to change
    const qb = this.followerRepository.createQueryBuilder('followers').leftJoinAndSelect('followers.userId', 'user');

    const followers = await qb.getMany();

    const followersCount = await qb.getCount();

    return {
      followers,
      followersCount,
    };
  }
}
