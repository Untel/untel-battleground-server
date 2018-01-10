import { Get, Controller } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WsResponse, OnGatewayConnection } from '@nestjs/websockets';

@WebSocketGateway({ port: 81 })
export class SocketComponent implements OnGatewayConnection {

    handleConnection(client: any) {
        console.log('Client Connected');
    }

    constructor() {
        console.log('Init socket');
    }

    @SubscribeMessage('message')
    onEvent(client, data): WsResponse<any> {
        console.log('Message received', client, data);
        const event = 'message';
        return { event, data };
    };

};