import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AppLogger } from 'src/app.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { SubnodditEntity } from './subnoddit.entity';
import { Repository } from 'typeorm';
import { SubnodditBody } from './interfaces/subnoddit.interface';
import { CreateSubnodditDto, UpdateSubnodditDto } from './dto';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class SubnodditService {
  private logger = new AppLogger('SubnodditService')

  constructor(@InjectRepository(SubnodditEntity) private readonly subnodditRepository: Repository<SubnodditEntity>,
  @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

  async create(createSubnodditDto: CreateSubnodditDto): Promise<SubnodditBody> {
    const { name, image, about } = createSubnodditDto;

    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .where('subnoddits.name = :name', {name})
      .getOne()

    if(subnoddit) {
      throw new BadRequestException('Name is taken')
    }

    const newSubnoddit = new SubnodditEntity()
    newSubnoddit.name = name;
    if(image) newSubnoddit.image = image; // TODO: upload to s3
    newSubnoddit.about = about;

    const savedSubnoddit = await this.subnodditRepository.save(newSubnoddit);
    return {subnoddit: savedSubnoddit};
  }

  async update(userId: number, subnodditId: number, updateSubnodditDto: UpdateSubnodditDto): Promise<SubnodditBody> {
    const {name, image, about, status} = updateSubnodditDto;

    const subnoddit = await this.isSubnodditValid(userId, subnodditId);

    if(name) subnoddit.name = name;
    if(image) subnoddit.image = image;
    if(about) subnoddit.about= about;
    if(status) subnoddit.status= status;

    const updatedSubnoddit = await this.subnodditRepository.save(subnoddit);
    return {subnoddit: updatedSubnoddit}
  }

  private async isSubnodditValid(userId: number, subnodditId: number): Promise<SubnodditEntity> {
    const subnoddit = await this.subnodditRepository
      .createQueryBuilder('subnoddits')
      .leftJoinAndSelect('subnoddits.user', 'user')
      .where('subnoddit.id = :id', {id: subnodditId})
      .getOne();

    if(!subnoddit) {
      throw new NotFoundException();
    }

    if(subnoddit.user.id !== userId) {
      throw new UnauthorizedException();
    }

    return subnoddit;
  }
}
