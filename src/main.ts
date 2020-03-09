import { AppMain } from './app.main';
import { AppLogger } from './app.logger';

const logger = new AppLogger('Bootstrap');

logger.log(`Start`);

const app = new AppMain();

// bootstrap app
app
  .bootstrap()
  .then(() => {
    logger.log('Server started');
  })
  .catch(err => {
    logger.error(err.message, err.stack);
    process.exit(1);
  });
