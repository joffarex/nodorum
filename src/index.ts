import exitHook from 'async-exit-hook';
import { AppMain, AppLogger } from './app';

const logger = new AppLogger();

logger.log(`Start`);

const app = new AppMain();

// bootstrap app
try {
	await app.bootstrap()
	logger.log('Server started')
} catch (err) {
	logger.error(err.message, err.stack)
	process.exit(1);

}

// exit app
const callback = await exitHook()

await app.shutdown()

logger.log('Shutting down the server')
callback()