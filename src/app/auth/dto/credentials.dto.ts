import { IsString } from 'class-validator';

export class CredentialsDto {

	@IsString()
	readonly email!: string;

	@IsString()
	readonly password!: string;
}