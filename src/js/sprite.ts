import { Point } from './primitives'; 

export class Sprite {
	offset : Point = { x: 0, y: 0 };

	width : number = 0;
	height : number = 0;

	constructor(offset: Point, width : number, height : number) {
		this.offset = offset;
		this.width = width;
		this.height = height;
	}
}