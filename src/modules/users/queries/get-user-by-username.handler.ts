import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByUsernameQuery } from './get-user-by-username.query';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers';
import { Result } from '../../../shared/core';
import { User } from '../../../domain/user-aggregate';

@QueryHandler(GetUserByUsernameQuery)
export class GetUserByUsernameHandler implements IQueryHandler<GetUserByUsernameQuery> {
  constructor(
    @InjectRepository(UserEntity) private readonly _userRepository: Repository<UserEntity>,
    private readonly _userMapper: UserMapper,
  ) {}

  async execute(query: GetUserByUsernameQuery): Promise<Result<User> | Result<string>> {
    const userEntity = await this._userRepository.findOne({ username: query.username });
    if (!userEntity) {
      return Result.fail(`User with username: ${query.username} does not exist`);
    }

    const user = this._userMapper.entityToDomain(userEntity);

    return Result.ok(user);
  }
}
