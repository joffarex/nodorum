import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {UserService} from './user.service';
import {Injectable} from '@nestjs/common';

@ValidatorConstraint({ name: 'userAlreadyExist', async: true })
@Injectable()
export class UserAlreadyExist implements ValidatorConstraintInterface {
	constructor(protected readonly userService: UserService) {}

	public async validate(email: string) {
		if (!this.userService) {
			return true;
		}
		const user = await this.userService.findByEmail(email);
		return !user;
	}
}