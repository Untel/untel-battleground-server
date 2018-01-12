import { IoAdapter } from '@nestjs/websockets';
import * as io from 'socket.io'
import * as http from 'http'
import { connect } from 'net';
import { Character } from './character.class';
import { cloneDeep, omit, values } from 'lodash';

export class ExtendedSocketIoAdapter extends IoAdapter {
    protected ioServer: SocketIO.Server;
    public gameState: any;

    public charactersAvailables = [
        {
            name: 'Jonh',
            spriteName: 'armored',
            hpMax: 150,
            hp: 150,
            velocity: 2,
            dammage: 5,
        }, {
            name: 'Exhib',
            spriteName: 'naked',
            hpMax: 100,
            hp: 5,
            velocity: 5,
            dammage: 50,
        }, {
            name: 'Gob Gob',
            spriteName: 'orc',
            hpMax: 125,
            hp: 125,
            velocity: 2,
            dammage: 7,
        }, {
            name: 'Skull',
            spriteName: 'skull',
            hpMax: 100,
            hp: 50,
            velocity: 1,
            dammage: 30,
        },
    ];

    constructor(protected server: http.Server) {
        super();
        this.ioServer = io(server);
        this.gameState = {
            characters: {}
        };
        let i = 0;
        this.ioServer.on('connection', (socket) => {
            let id = socket.client.id;
            console.log('[SOCKET] New player: ', id);
            const newCharacter: Character = new Character({ 
                id,
                x: Math.floor(Math.random() * 300),
                y: Math.floor(Math.random() * 300),
                ...this.charactersAvailables[i]
            });
            i++;
            if (i % 4 === 0) {
                i = 0;
            }
            this.gameState.characters[id] = newCharacter;

            // Say to other players that a new player is coming.
            socket.broadcast.emit('newPlayer', newCharacter)

            // Send to te new player the actual game state.
            socket.emit('state', this.gameState);
            
            socket.on('move', (data) => {
                this.gameState.characters[socket.id] = {...this.gameState.characters[socket.id], ...data};
                socket.broadcast.emit('move', this.gameState.characters[socket.id]);
            });

            socket.on('disconnect', (socket) => {
                console.log('[SOCKET] player disc: ', id);
                this.gameState.characters = omit(this.gameState.characters, id);
                console.log(this.gameState);
                this.ioServer.emit('state', this.gameState);
            });

            socket.on('hit', (direction) => {
                console.log('[SOCKET] player' + id + ' is hitting ...');
                const attacker: Character = this.gameState.characters[id];
                const others: Array<Character> = values(this.gameState.characters)
                    .filter((c: Character) => c.id !== attacker.id);
                let hitten = [];



                others.filter(c => c.y - 5 <= attacker.y && c.x - 10 <= attacker.x - 5).forEach(char => {
                    console.log('... And touched ' + char.id);
                    this.gameState.characters[char.id].hp -= attacker.dammage;
                });


                this.ioServer.emit('state', this.gameState);
                
            });

        });


    }

    create(port: number) {
        console.log('websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead');
        return this.ioServer;
    }

}
