import { NestFactory, NestFactoryStatic } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { ExtendedSocketIoAdapter } from './socket-adapter.component';
import * as express from 'express';

async function bootstrap() {
	const expressApp = express();
	const server = require('http').createServer(expressApp);
	const app = await NestFactory.create(ApplicationModule, expressApp);
	app.useWebSocketAdapter(new ExtendedSocketIoAdapter(server));
	app.use(express.static('public'));
	await app.init();
	server.listen(8080);
	console.log('Server started on port 8080');
}
bootstrap();
