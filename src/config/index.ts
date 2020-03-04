import {readFileSync} from 'fs';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';
import {ConnectionOptions} from 'typeorm' 



const appPackage = readFileSync(`${__dirname}/../../package.json`, {
	encoding: 'utf8'
});
const appData = JSON.parse(appPackage);

interface Config {
	appRootPath: string;
	version: string;
	name: string;
	description: string;
	uuid: string;
	jwtSecret: string;
	isProduction: boolean;
	salt: string;
	passwordMinLength: number;
	mail: {
		from: string
	};
	database: ConnectionOptions;
	session: {
		domain: string;
		secret: string;
		timeout: number;
		refresh: {
			secret: string;
			timeout: number;
		};
		passwordReset: {
			secret: string;
			timeout: number;
		};
		verify: {
			secret: string;
			timeout: number;
		}
	};
	aws: {
		apiKey: string;
		secretKey: string;
		region: string;
		s3: {
			bucketName: string
		};
	};
	port: number;
	host: string;
	microservice: MicroserviceOptions;
	logger: {
		level: string;
		transports?: any[];
	};
	validator: {
		validationError: {
			target: boolean;
			value: boolean;
		}
	};
}

export const config: Config = {
	appRootPath: `${__dirname}/../app`,
	version: appData.version,
	name: appData.name,
	description: appData.description,
	uuid: process.env.APP_UUID || 'R4ND0M',
	jwtSecret: process.env.JWT_SECRET || 'R4ND0M',
	isProduction: process.env.NODE_ENV === 'production',
	salt: process.env.APP_SALT || '53CR3T',
	passwordMinLength: 8,
	mail: {
		from: process.env.APP_MAIL_FROM || 'dev@noddit.com'
	},
	database: {
		type: 'postgres',
		url: process.env.APP_DATABASE_SECRET_URL,
		// synchronize: true,
		logging: 'all',
		// migrationsRun: true,
		// migrations: [
		// 	__dirname + '/../migrations/*{.ts,.js}'
		// ],
		entities: [
			`${__dirname}/../**/*.entity{.ts,.js}`
		]
	},
	session: {
		domain: process.env.APP_SESSION_DOMAIN || 'localhost',
		secret: process.env.APP_SESSION_SECRET || '53CR3T',
		timeout: Number(process.env.APP_SESSION_TIMEOUT),
		refresh: {
			secret: process.env.APP_SESSION_REFRESH_SECRET || '53CR3T',
			timeout: Number(process.env.APP_SESSION_REFRESH_TIMEOUT)
		},
		passwordReset: {
			secret: process.env.APP_SESSION_PASSWORD_RESET_SECRET || '53CR3T',
			timeout: Number(process.env.APP_SESSION_PASSWORD_RESET_TIMEOUT)
		},
		verify: {
			secret: process.env.APP_SESSION_VERIFY_SECRET || '53CR3T',
			timeout: Number(process.env.APP_SESSION_VERIFY_TIMEOUT)
		}
	},
	aws: {
		apiKey: process.env.APP_AWS_API_KEY || 'apikey',
		secretKey: process.env.APP_AWS_SECRET_KEY || 'secretkey',
		region: process.env.APP_AWS_REGION || 'region',
		s3: {
			bucketName: process.env.APP_AWS_S3_BUCKET_NAME || 'bucket'
		},
	},
	port: Number(process.env.APP_PORT),
	host: process.env.APP_HOST || 'localhost',
	microservice: {
		transport: Transport.TCP
	},
	logger: {
		level: process.env.APP_LOGGER_LEVEL || 'error'
	},
	validator: {
		validationError: {
			target: false,
			value: false
		}
	}
};