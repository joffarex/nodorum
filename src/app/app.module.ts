import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {AuthModule} from './auth/auth.module';
import {AppLogger} from './app.logger';
import {UserModule} from './user/user.module';
import {SecurityModule} from './security';
import { config } from 'src/config';

@Module({
	imports: [
		SecurityModule,
		TypeOrmModule.forRoot(config.database),
		AuthModule,
		UserModule,
	]
})
export class AppModule {
	private logger = new AppLogger();

	constructor() {
		this.logger.log('Initialize constructor');
	}

	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestContextMiddleware)
			.forRoutes({path: '*', method: RequestMethod.ALL});
	}
}