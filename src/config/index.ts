import { readFileSync } from 'fs';

const appPackage = readFileSync(`${__dirname}/../../package.json`, {
  encoding: 'utf8',
});
const appData = JSON.parse(appPackage);

export default () => ({
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
    from: process.env.APP_MAIL_FROM || 'dev@noddit.com',
  },
  database: {
    type: 'postgres',
    url: process.env.APP_DATABASE_URL,
    synchronize: true,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  },
  session: {
    domain: process.env.APP_SESSION_DOMAIN || 'localhost',
    secret: process.env.APP_SESSION_SECRET || '53CR3T',
    timeout: Number(process.env.APP_SESSION_TIMEOUT),
    refresh: {
      secret: process.env.APP_SESSION_REFRESH_SECRET || '53CR3T',
      timeout: Number(process.env.APP_SESSION_REFRESH_TIMEOUT),
    },
    passwordReset: {
      secret: process.env.APP_SESSION_PASSWORD_RESET_SECRET || '53CR3T',
      timeout: Number(process.env.APP_SESSION_PASSWORD_RESET_TIMEOUT),
    },
    verify: {
      secret: process.env.APP_SESSION_VERIFY_SECRET || '53CR3T',
      timeout: Number(process.env.APP_SESSION_VERIFY_TIMEOUT),
    },
  },
  port: Number(process.env.APP_PORT),
  host: process.env.APP_HOST || 'localhost',
  logger: {
    level: process.env.APP_LOGGER_LEVEL || 'error',
  },
  validator: {
    validationError: {
      target: false,
      value: false,
    },
  },
});
