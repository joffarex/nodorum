import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {JwtStrategy} from './strategies';
import {AuthController} from './auth.controller';
import {UserModule} from '../user/user.module';

@Module({
	imports: [UserModule],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController]
})
export class AuthModule {
}