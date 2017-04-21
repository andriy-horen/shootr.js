import { Game } from './game';
import { Entity } from './entity';
import { GenericMap as Map } from './collections';
import { Point, Vector } from './primitives';
import { Body } from './body';

import { Sprite } from './sprite';
import { Frame } from './frame';
import { Animation } from './animation';

import * as Random from './random';

export class Enemy extends Entity {
	private _animations : Map<Animation> = {
			'idle' : new Animation(1, 0, Frame.create(0, 0, 36, 36)),
			'right' : new Animation(4, 0, Frame.create(0, 0, 36, 36)),
			'left' : new Animation(4, 1, Frame.create(0, 0, 36, 36))
    };
    private _lastHit: Date = new Date(0);
    private _game: Game;


    public currentAnimation : Animation;
    public speed : number = 2.5;
    public dagameAmount: number = 5;
    public attackSpeed: number = 250;
    public target : Entity;
    public body : Body;

	constructor(gameInstance: Game, target: Entity) {
		super();

        this._game = gameInstance;
        this.target = target;

        let randomX = Random.getRandomInt(0, this._game.canvas.width);
        let randomY = Random.getRandomInt(0, this._game.canvas.height);

        this.body = new Body(new Vector(randomX, randomY), 36, 36);

		this.animate('right');
	}

	animate(animation : string) : void {
		this.currentAnimation = this._animations[animation];
		this.currentAnimation.speed = 10;
	}

    // TODO : investigate issue with diagonal speed. ~2.12 when is supposed to be 3
	moveTowards(position: Point) : void {
        let dx = Math.abs(position.x - this.body.position.x);
        let dy = Math.abs(position.y - this.body.position.y);

        let dirX = Math.sign(position.x - this.body.position.x);
        let dirY = Math.sign(position.y - this.body.position.y);

        this.body.velocity.x = dx * (this.speed / (dx + dy)) * dirX;
        this.body.velocity.y = dy * (this.speed / (dx + dy)) * dirY;

        if (dirX > 0) {
            this.animate('right');
        } else {
            this.animate('left');
        }

        this.body.update();
	}

    private canHit(): boolean {
        let diff = this._game.gameTime.getTime() - this._lastHit.getTime();

		return diff > this.attackSpeed;
    }

    hit(target: Entity): void {
        if (this.canHit()) {
            target.damage(this.dagameAmount, this);

            this._lastHit = new Date();
        }
    }

	update() : void {
		this.moveTowards(this.target.body.position);

        //console.log('Enemy speed: ' + this.body.speed);
	}
}
