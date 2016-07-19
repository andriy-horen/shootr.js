import { Entity } from './entity';
import { GenericMap as Map } from './collections';
import { Point } from './point';
import { Body } from './body';

import { Sprite } from './sprite';
import { Frame } from './frame';
import { Animation } from './animation';

export class Enemy extends Entity {
	private _animations : Map<Animation> = {
			'idle' : new Animation(1, 0, Frame.create(0, 0, 36, 36)),
			'right' : new Animation(4, 0, Frame.create(0, 0, 36, 36)),
			'left' : new Animation(4, 1, Frame.create(0, 0, 36, 36))
    };

    public currentAnimation : Animation;
    public speed : number = 3;
    public target : Entity;
    public body : Body = new Body({ x: 100, y: 100 }, 36, 36);

	constructor(target: Entity) {
		super();

        this.target = target;

		this.animate('right');
	}

	animate(animation : string) : void {
		this.currentAnimation = this._animations[animation];
		this.currentAnimation.speed = 10;
	}

	moveTowards(position: Point) : void {
        let dx = Math.abs(position.x - this.body.position.x);
        let dy = Math.abs(position.y - this.body.position.y);

        let dirX = position.x - this.body.position.x > 0 ? 1 : -1;
        let dirY = position.y - this.body.position.y > 0 ? 1 : -1;

        let velX = dx * (this.speed / (dx + dy)) * dirX;
        let velY = dy * (this.speed / (dx + dy)) * dirY;

        this.body.position.x += velX;
        this.body.position.y += velY;


        if (dirX > 0) {
            this.animate('right');
        } else {
            this.animate('left');
        }
	}

	update() : void {
		this.moveTowards(this.target.body.position);
	}
}
