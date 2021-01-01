import { IMapper } from '../../../shared/core';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { User } from '../../../domain/user-aggregate';

export class UserMapper implements IMapper<UserEntity, User> {
  domainToEntity(domain: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = domain.userId;
    userEntity.username = domain.username;
    userEntity.email = domain.email;
    userEntity.password = domain.password;

    return userEntity;
  }

  entityToDomain(entity: UserEntity): User {
    const user = User.createWithId(entity.id, entity.username, entity.email, entity.password);
    user.isEmailVerified = !!entity.verifiedAt;
    user.isDeleted = !!entity.deletedAt;

    return user;
  }
}
