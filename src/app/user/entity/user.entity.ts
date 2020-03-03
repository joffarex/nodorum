import {IsEmail, IsOptional, IsString, IsUrl, MinLength, Validate, ValidateIf} from 'class-validator';
import {UserAlreadyExist} from '../user.validator';
import {config} from '../../../config';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import { ExtendedBaseEntity, passwordHash } from 'src/app/shared';

@Entity()
export class UserEntity extends ExtendedBaseEntity {

  @PrimaryGeneratedColumn({ unsigned: true })
	public id!: string;

	@IsString()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })	public firstName!: string;

	@IsString()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })  public lastName!: string;
  
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  public username!: string;

	@IsEmail()
	@IsOptional()
	@ValidateIf(o => !o.id)
	@Validate(UserAlreadyExist, {
		message!: 'User already exists'
	})
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
	public email!: string;

	@IsOptional()
	@IsUrl()
  @Column({
    type: 'varchar',
    length: 700,
    nullable: true,
    default: 'pictures/blank-profile-picture-S4P3RS3CR3T',
  })	public profileImage!: string;

	@MinLength(config.passwordMinLength)
	@IsOptional()
	@Column({
    type: 'varchar',
    length: 700,
    select: false,
  })
	public password!: string;

	hashPassword() {
		this.password = passwordHash(this.password);
	}
}