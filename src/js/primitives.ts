export interface Point {
	x : number;
	y : number;
}


export interface Rect { 
	x: number;
	y: number;
	width: number;
	height: number;
}

export class Vector {
	x : number = 0;
	y : number = 0;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	public set(value: number | Vector): void {
		if (typeof value === "number") {
			this.x = this.y = value;
		} else {
			this.x = value.x;
			this.y = value.y;
		}
	}

	public clone(): Vector {
		return new Vector(this.x, this.y);
	}

	public magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	static add(vec1: Vector, vec2: Vector): Vector {
		return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
	}

	static subtract(vec1: Vector, vec2: Vector): Vector {
		return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
	}

	static multiply(vec: Vector, scalar: number) {
		return new Vector(vec.x * scalar, vec.y * scalar);
	}

	static from(point: Point) {
		return new Vector(point.x, point.y);
	}
}