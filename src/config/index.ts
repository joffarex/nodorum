import { readFileSync } from 'fs';

const appPackage = readFileSync(`${__dirname}/../../package.json`, {
  encoding: 'utf8',
});
const appData = JSON.parse(appPackage);

export default () => ({
  appRootPath: `${__dirname}/../`,
  version: appData.version,
  name: appData.name,
  description: appData.description,
  isProduction: process.env.NODE_ENV === 'production',
  database: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    entities: [`${__dirname}/../infrastructure/entities/*.entity{.ts,.js}`],
  },
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  logger: {
    level: process.env.LOGGER_LEVEL || 'error',
  },
});
