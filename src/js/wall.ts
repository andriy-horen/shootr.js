import { Entity } from './entity';
import { Animation } from './animation';
import { Frame } from './frame';
import { Body } from './body';
import { Point, Vector } from './primitives';

export class Wall extends Entity {
	public body: Body = new Body(new Vector(), 151, 211);
	public currentAnimation = new Animation(1, 0, Frame.create(0, 0, 151, 211));

	constructor(position: Point) {
		super();
		this.body.position = Vector.from(position);
	}
}
