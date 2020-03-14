import { Repository } from 'typeorm';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MessageResponse } from 'src/shared';
import { AppLogger } from 'src/app.logger';
import { SubnodditEntity } from './subnoddit.entity';
import { CreateSubnodditDto, UpdateSubnodditDto, FilterDto } from './dto';
import { SubnodditBody, SubnodditsBody } from './interfaces/subnoddit.interface';
import { UserEntity } from 'src/user/user.entity';
import { PostEntity } from 'src/post/post.entity';

@Injectable()
export class SubnodditService {
  private logger = new AppLogger('SubnodditService');

  constructor(
    @InjectRepository(SubnodditEntity) private readonly subnodditRepository: Repository<SubnodditEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    userId: number,
    createSubnodditDto: CreateSubnodditDto,
  ): Promise<SubnodditBody> {
    const { name, image, about } = createSubnodditDto;

    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .where('subnoddits.name = :name', { name })
      .getOne();

    if (subnoddit) {
      throw new BadRequestException(`Subnoddit with the name '${name}' already exists`);
    }

    const user = await this.userRepository.findOne(userId);
    if (!user) {
      this.logger.error(`[create] user with id: ${userId} not found. There might be a problem in a Jwt invalidation`);
      throw new NotFoundException('User not found');
    }

    const newSubnoddit = new SubnodditEntity();
    newSubnoddit.name = name;
    if (image) newSubnoddit.image = await this.uploadImage(image, name);
    newSubnoddit.about = about;
    newSubnoddit.user = user;

    const savedSubnoddit = await this.subnodditRepository.save(newSubnoddit);
    return { subnoddit: savedSubnoddit };
  }

  async findOne(subnodditId: number): Promise<SubnodditBody & { subnodditPostsCount: number }> {
    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .leftJoinAndSelect('subnoddits.user', 'user')
      .where("subnoddits.status = 'ACTIVE'")
      .andWhere('subnoddits.id = :id', { id: subnodditId })
      .getOne();

    if (!subnoddit) {
      throw new NotFoundException('Subnoddit not found');
    }

    const subnodditPostsCount = await this.getSubnodditPostsCount(subnoddit.id);

    return { subnoddit, subnodditPostsCount };
  }

  async findMany(filter: FilterDto): Promise<SubnodditsBody> {
    const qb = this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .leftJoinAndSelect('subnoddits.user', 'user')
      .where("subnoddits.status = 'ACTIVE'");

    if ('username' in filter) {
      const user = await this.userRepository.findOne({ username: filter.username });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      qb.andWhere('"subnoddits"."userId" = :userId', { userId: user.id });
    }

    qb.orderBy('subnoddit.createdAt', 'DESC');

    const subnodditsCount = await qb.getCount();

    // for pagination
    if ('limit' in filter) {
      qb.limit(filter.limit);
    }

    if ('offset' in filter) {
      qb.offset(filter.offset);
    }

    if ('name' in filter) {
      qb.andWhere('subnoddits.name LIKE :name', { name: `%${filter.name}%` });
    }

    const subnoddits = await qb.getMany();

    return {
      subnodditsCount,
      subnoddits,
    };
  }

  async update(userId: number, subnodditId: number, updateSubnodditDto: UpdateSubnodditDto): Promise<SubnodditBody> {
    const { name, image, about, status } = updateSubnodditDto;

    const subnoddit = await this.isSubnodditValid(userId, subnodditId);

    if (name) subnoddit.name = name;
    if (image) subnoddit.image = image;
    if (about) subnoddit.about = about;
    if (status) subnoddit.status = status;

    const updatedSubnoddit = await this.subnodditRepository.save(subnoddit);
    return { subnoddit: updatedSubnoddit };
  }

  async delete(userId: number, subnodditId: number): Promise<MessageResponse> {
    const subnoddit = await this.isSubnodditValid(userId, subnodditId);

    const subnodditPostsCount = await this.getSubnodditPostsCount(subnoddit.id);

    if (subnodditPostsCount > 0) {
      throw new BadRequestException(
        `There are ${subnodditPostsCount} posts in this subnoddit and it can not be removed`,
      );
    }

    const { affected } = await this.subnodditRepository.delete(subnoddit.id);

    if (affected !== 1) {
      throw new InternalServerErrorException();
    }

    return { message: 'Post successfully removed.' };
  }

  private async isSubnodditValid(userId: number, subnodditId: number): Promise<SubnodditEntity> {
    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .addSelect('subnoddits.status')
      .leftJoinAndSelect('subnoddits.user', 'user')
      .where('subnoddit.id = :id', { id: subnodditId })
      .getOne();

    if (!subnoddit) {
      throw new NotFoundException('Subnoddit not found');
    }

    if (subnoddit.user.id !== userId) {
      throw new UnauthorizedException();
    }

    return subnoddit;
  }

  private async getSubnodditPostsCount(subnodditId: number): Promise<number> {
    return this.postRepository
      .createQueryBuilder('posts')
      .where('"posts"."subnodditId" = :subnodditId', { subnodditId })
      .getCount();
  }

  private async uploadImage(image: string, name: string): Promise<string> {
    // const base64 = Buffer.from(image.replace(/^body:image\/\w+;base64,/, ''), 'base64');

    const bucketName = this.configService.get<string>('aws.s3BucketName');

    if (!bucketName) {
      throw new InternalServerErrorException();
    }

    // const { key } = await this.awsS3Service.upload(
    //   {
    //     Bucket: bucketName,
    //     Key: `pictures/subnoddit/${name}.png`,
    //     Body: base64,
    //     ACL: 'public-read',
    //     ContentEncoding: 'base64',
    //     ContentType: `image/png`,
    //   },
    //   opts,
    // );
    const key = `pictures/subnoddit/${name}.png`

    return key;
  }
}
