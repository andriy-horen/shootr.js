import { Point } from './point';

export class Body {
	position : Point;
	velocity: Point = { x: 0, y: 0 };

	width : number;
	height : number;

	constructor(position: Point, width: number, height: number) {
		this.position = position;
		this.width = width;
		this.height = height;
	}

	update() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}