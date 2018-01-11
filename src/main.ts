import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { ExtendedSocketIoAdapter } from './socket-adapter.component';

async function bootstrap() {
	const expressApp = require('express')();
	const server = require('http').createServer(expressApp);
	const app = await NestFactory.create(ApplicationModule, expressApp);
	app.useWebSocketAdapter(new ExtendedSocketIoAdapter(server));
	await app.init();
	server.listen(3000);
}
bootstrap();
