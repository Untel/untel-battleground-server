import { get } from 'lodash';

export class Character {

    public id: string;
    public name: string;
    public spriteName: string;
    public hp: number;
    public hpMax: number;
    public x: number;
    public y: number;
    public velocity: number;
    public isMe: boolean;
    public lastAction: any;
    public lastDirection: any;

    constructor(parameters: CharacterCtor) {
        this.id = get(parameters, 'id');
        this.name = get(parameters, 'name') || this.id;
        this.spriteName = get(parameters, 'spriteName') || 'naked';
        this.hp = get(parameters, 'hp') || 100;
        this.hpMax = get(parameters, 'hpMax') || 100;
        this.x = get(parameters, 'x') || 0;
        this.y = get(parameters, 'y') || 0;
        this.velocity = get(parameters, 'velocity') || 1;
        this.isMe = get(parameters, 'isMe') || false;
        this.lastAction = get(parameters, 'lastAction') || 'walk';
        this.lastDirection = get(parameters, 'lastDirection') || 0;
    }
}

export interface CharacterCtor {
    id: string;
    name?: string;
    spriteName?: string;
    hp?: number;
    hpMax?: number;
    x?: number;
    y?: number;
    velocity?: number;
    isMe?: boolean;
    lastAction?: any;
    lastDirection?: any;
};