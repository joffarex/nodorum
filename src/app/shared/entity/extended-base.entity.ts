import {BaseEntity, Column} from 'typeorm';
import {DateTime} from 'luxon';

export class ExtendedBaseEntity extends BaseEntity {
	public id?: string;

	@Column()
	public isDeleted = false;

	@Column()
	public createdAt!: DateTime;

	@Column()
	public updatedAt!: DateTime;
}