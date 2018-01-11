import { IoAdapter } from '@nestjs/websockets';
import * as io from 'socket.io'
import * as http from 'http'
import { connect } from 'net';
import { Character } from './character.class';
import { cloneDeep, omit } from 'lodash';

export class ExtendedSocketIoAdapter extends IoAdapter {
    protected ioServer: SocketIO.Server;
    public gameState: any;

    constructor(protected server: http.Server) {
        super();
        this.ioServer = io(server);
        this.gameState = {
            characters: {}
        };

        this.ioServer.on('connection', (socket) => {
            const id = socket.client.id;
            console.log('[SOCKET] New player: ', id);
            const newCharacter: Character = new Character({ id });
            this.gameState.characters[id] = newCharacter;

            // Say to other players that a new player is coming.
            socket.broadcast.emit('newPlayer', newCharacter)

            // Send to te new player the actual game state.
            socket.emit('state', this.gameState);
            
            socket.on('move', (data) => {
                this.gameState.characters[socket.id] = {...this.gameState.characters[socket.id], ...data};
                socket.broadcast.emit('move', this.gameState.characters[socket.id]);
            });

            socket.on('disconnect', () => {
                console.log('[SOCKET] New player: ', socket.id);
                omit(this.gameState.characters, socket.id);
                socket.broadcast.emit('disconnected', socket.id);
            });
        });


    }

    create(port: number) {
        console.log('websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead');
        return this.ioServer;
    }

}
