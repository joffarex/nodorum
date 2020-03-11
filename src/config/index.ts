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
  uuid: process.env.UUID || 'R4ND0M',
  jwtSecret: process.env.JWT_SECRET || 'R4ND0M',
  isProduction: process.env.NODE_ENV === 'production',
  salt: process.env.SALT || '53CR3T',
  passwordMinLength: 8,
  mail: {
    from: process.env.MAIL_FROM || 'dev@noddit.com',
  },
  database: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  },
  session: {
    domain: process.env.SESSION_DOMAIN || 'localhost',
    secret: process.env.SESSION_SECRET || '53CR3T',
    timeout: Number(process.env.SESSION_TIMEOUT),
    refresh: {
      secret: process.env.SESSION_REFRESH_SECRET || '53CR3T',
      timeout: Number(process.env.SESSION_REFRESH_TIMEOUT),
    },
    passwordReset: {
      secret: process.env.SESSION_PASSWORD_RESET_SECRET || '53CR3T',
      timeout: Number(process.env.SESSION_PASSWORD_RESET_TIMEOUT),
    },
    verify: {
      secret: process.env.SESSION_VERIFY_SECRET || '53CR3T',
      timeout: Number(process.env.SESSION_VERIFY_TIMEOUT),
    },
  },
  port: Number(process.env.PORT),
  host: process.env.HOST || 'localhost',
  logger: {
    level: process.env.LOGGER_LEVEL || 'error',
  },
  validator: {
    validationError: {
      target: false,
      value: false,
    },
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD,
  },
  smtpTransport: process.env.SMTP_URL,
});
