import { Get, Controller } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';

@Controller()
export class AppController {
	@Get()
	root(): string {
    return 'Hello World!';
  }
}
