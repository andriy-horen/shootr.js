import { Entity } from './entity';
import { World } from './world';
import { Point, Vector } from './primitives';
import { noop } from './util';

export class Body {
	position: Vector = new Vector();
	velocity: Vector = new Vector();
	overlap: Vector = new Vector();
	speed: number;
	width: number;
	height: number;

	constructor(position: Vector, width: number, height: number) {
		this.position = position;
		this.width = width;
		this.height = height;
	}

	// TODO: Needs to be improved beacause more FPS results in faster movement;
	private updateMovement(): void {
		this.position = Vector.add(this.position, this.velocity);

		this.speed = Math.hypot(this.velocity.x, this.velocity.y);
	}

	update() {
		this.updateMovement();
	}
}
