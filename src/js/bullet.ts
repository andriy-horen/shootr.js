import { Entity } from './entity';
import { Body } from './body';
import { Point } from './point';
import { Animation } from './animation';
import { Frame } from './frame';
import { Sprite } from './sprite';

export class Bullet extends Entity {
	public target : Point;
	public parent : Entity;
	public speed : number = 10;
	public damageAmount : number = 10;
	public body : Body = new Body({ x: 0, y: 0}, 3, 3);
	public currentAnimation: Animation = new Animation(1, 0, Frame.create(0, 0, 10, 10));

	constructor(position: Point, target: Point, parent : Entity) {
		super();

		this.body.position = position;
		this.target = target;
		this.parent = parent;

		this.setVelocity(this.target);
	}

	private setVelocity(position: Point) : void {
        let dx = Math.abs(position.x - this.body.position.x);
        let dy = Math.abs(position.y - this.body.position.y);

        let dirX = position.x - this.body.position.x > 0 ? 1 : -1;
        let dirY = position.y - this.body.position.y > 0 ? 1 : -1;

        let x = dx * (this.speed / (dx + dy)) * dirX;
        let y = dy * (this.speed / (dx + dy)) * dirY;

        this.body.velocity = { x, y };
	}

	update() : void {
		this.body.update();
	}
}
