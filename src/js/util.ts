import { Point } from './point';

export class Util {
	static clamp(value : number, min : number, max : number) : number {
		if (value > max) { return max; }
		if (value < min) { return min; }

		return value;
	}

	static addPoint(point1: Point, point2: Point) : Point {
		return {
			x : point1.x + point2.x,
			y : point1.y + point2.y
		}
	}
}
