import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubnodditEntity } from './subnoddit.entity';
import { Repository } from 'typeorm';
import { SubnodditBody, SubnodditsBody } from './interfaces/subnoddit.interface';
import { CreateSubnodditDto, UpdateSubnodditDto, FilterDto } from './dto';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class SubnodditService {
  constructor(
    @InjectRepository(SubnodditEntity) private readonly subnodditRepository: Repository<SubnodditEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(userId: number, createSubnodditDto: CreateSubnodditDto): Promise<SubnodditBody> {
    const { name, image, about } = createSubnodditDto;

    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .where('subnoddits.name = :name', { name })
      .getOne();

    if (subnoddit) {
      throw new BadRequestException('Name is taken');
    }

    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const newSubnoddit = new SubnodditEntity();
    newSubnoddit.name = name;
    if (image) newSubnoddit.image = image; // TODO: upload to s3
    newSubnoddit.about = about;
    newSubnoddit.user = user;

    const savedSubnoddit = await this.subnodditRepository.save(newSubnoddit);
    return { subnoddit: savedSubnoddit };
  }

  async findOne(subnodditId: number): Promise<SubnodditBody> {
    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .leftJoinAndSelect('subnoddits.user', 'user')
      .where("subnoddits.status = 'ACTIVE'")
      .andWhere('subnoddits.id = :id', { id: subnodditId })
      .getOne();

    if (!subnoddit) {
      throw new NotFoundException();
    }

    return { subnoddit };
  }

  async findMany(filter: FilterDto): Promise<SubnodditsBody> {
    const qb = this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .leftJoinAndSelect('subnoddits.user', 'user')
      .where("subnoddits.status = 'ACTIVE'");

    if ('username' in filter) {
      const user = await this.userRepository.findOne({ username: filter.username });

      if (!user) {
        throw new NotFoundException();
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

    // TODO: get posts cound

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

  async delete(userId: number, subnodditId: number): Promise<{ message: string }> {
    const subnoddit = await this.isSubnodditValid(userId, subnodditId);

    // TODO: restrict subnoddit removal if there are posts

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
      throw new NotFoundException();
    }

    if (subnoddit.user.id !== userId) {
      throw new UnauthorizedException();
    }

    return subnoddit;
  }
}
