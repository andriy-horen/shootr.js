import { Sprite } from './sprite';

export class Frame {
	index : number = 0;
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;
	name : string;

	static create(x: number, y: number, width: number, height: number): Frame {
		let frame = new Frame();

		frame.x = x;
		frame.y = y;
		frame.width = width;
		frame.height = height;
		frame.name = name;

		return frame;
	}
}
