import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserBody } from './interfaces/user.interface';
import { RegisterUserDto, UpdateUserDto, LoginUserDto } from './dto';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, verify } from 'argon2';
import { AppLogger } from '../app.logger';

@Injectable()
export class UserService {
  private logger = new AppLogger('UserService');

  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

  async register(registerUserDto: RegisterUserDto): Promise<UserBody> {
    const { username, email, password, displayName, profileImage, bio } = registerUserDto;
    // check if username and email are unique
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('user.username = :username', { username })
      .orWhere('user.email = :email', { email })
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
    const user = await this.userRepository
      .createQueryBuilder('users')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // check if passwords match
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const match = await verify(user.password!, password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { user };
  }

  async findOne(id: number): Promise<UserBody> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    return { user };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserBody> {
    const { displayName, profileImage, bio } = dto;
    // ensure that user exists
    const user = await this.userRepository.findOne(id);
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

    // affected only equals to one if everything was successful
    // if it is anything other than one, that means we have an error
    const { affected } = await this.userRepository.delete(id);

    if (affected !== 1) {
      throw new InternalServerErrorException();
    }

    return { message: 'User successfully removed.' };
  }
}
