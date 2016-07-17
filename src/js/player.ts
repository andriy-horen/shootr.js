import { Game } from './game';
import { Entity } from './entity';
import { Point } from './point';
import { Action } from './input';
import { Body } from './body';
import { Bullet } from './bullet';
import { Frame } from './frame';
import { Sprite } from './sprite';
import { Animation } from './animation';
import { GenericMap as Map } from './collections';
import { Util } from './util';
 
export class Player extends Entity {
	private _game : Game;
	private _lastShot : Date = new Date(0);

	public body : Body = new Body({ x: 10, y: 10 }, 36, 36);
	public speed: number = 3;
	public attackSpeed = 150;

	public currentAnimation : Animation;
	private _animations : Map<Animation> = {
	    'idle' : new Animation(new Frame(1, 0, new Sprite({x: 0, y: 0}, 36, 36))),
	    'right' : new Animation(new Frame(4, 0, new Sprite({x: 0, y: 0}, 36, 36))),
	    'left' : new Animation(new Frame(4, 1, new Sprite({x: 0, y: 0}, 36, 36)))
	};
	private _bulletOffset : Point = { x: 12, y: 18 }; 

	constructor(gameInstance: Game) {
		super();
		
		this._game = gameInstance;

        this.animate('idle');
	}

	shoot() : void {
		if (this.canShoot()) {
			this._lastShot = new Date();
			let bulletSpawn = Object.assign({}, Util.addPoint(this.body.position, this._bulletOffset));

			let bullet = new Bullet(bulletSpawn, this._game.mouse, this);
			this._game.bullets.push(bullet);
		}
	}

	private canShoot() : boolean { 
		let diff = this._game.gameTime.getTime() - this._lastShot.getTime();

		return diff > this.attackSpeed;
	}

	animate(animation : string): void {
		this.currentAnimation = this._animations[animation];
		this.currentAnimation.speed = 100;
	}

	upateMovement() : void {
		let input = this._game.input;

		if (input.actions[Action.Left]) {
			this.body.position.x -= this.speed;
			this.animate('left');

		} else if (input.actions[Action.Right]) {
			this.body.position.x += this.speed;
			this.animate('right');
		}
        
        if (input.actions[Action.Up]) {

			this.body.position.y -= this.speed;

		} else if (input.actions[Action.Down]) {
			
			this.body.position.y += this.speed;
		}

		if (input.actions[Action.Attack]) {
	        this.shoot();
		}
	}

	update() : void {
		this.upateMovement();
	}
}