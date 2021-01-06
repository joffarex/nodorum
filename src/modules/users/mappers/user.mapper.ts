import { IMapper } from '../../../shared/core';
import { UserEntity } from '../../../shared/infrastructure/entities';
import { User, UserPassword } from '../../../domain/user-aggregate';

export class UserMapper implements IMapper<UserEntity, User> {
  async domainToEntity(domain: User): Promise<UserEntity> {
    const userEntity = new UserEntity();
    userEntity.id = domain.userId;
    userEntity.username = domain.username;
    userEntity.email = domain.email;
    userEntity.password = domain.password.value;

    return userEntity;
  }

  async entityToDomain(entity: UserEntity): Promise<User> {
    const userPassword = await UserPassword.create(entity.password, true);

    const user = User.createWithId(entity.id, entity.username, entity.email, userPassword.value);
    user.isEmailVerified = !!entity.verifiedAt;
    user.isDeleted = !!entity.deletedAt;

    return user;
  }
}
