import { AppMain } from './app.main';
import { AppLogger } from './shared/core';

const logger = new AppLogger('Bootstrap');

logger.log(`Start`);

const app = new AppMain();

app
  .bootstrap()
  .then(() => {
    logger.log('Server started');
  })
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
