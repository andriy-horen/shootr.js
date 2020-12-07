import { Body } from './body';
import { Vector } from './primitives';

export class Physics {
	/**
	 * Checks if two rectangular bodies intersect
	 * @param  {Rect} body1 First body with {x,y} position and {width, height}
	 * @param  {Rect} body2 Second body
	 * @return {bool} True if they intersect, otherwise false
	 */
	static intersects(body1: Body, body2: Body): boolean {
		let intersectionX =
			body1.position.x < body2.position.x + body2.width &&
			body1.position.x + body1.width > body2.position.x;

		let intersectionY =
			body1.position.y < body2.position.y + body2.height &&
			body1.position.y + body1.height > body2.position.y;

		return intersectionX && intersectionY;
	}

	static collide(
		body1: Body,
		body2: Body,
		collisionCallback: Function
	): boolean {
		if (this.intersects(body1, body2)) {
			collisionCallback();

			return true;
		}

		return false;
	}

	static getOverlap(body1: Body, body2: Body): Vector {
		if (this.intersects(body1, body2) === false) {
			return Vector.from({ x: 0, y: 0 });
		}

		let overlapX1 = body2.position.x - (body1.position.x + body1.width);
		let overlapX2 = body2.position.x + body2.width - body1.position.x;

		let overlapY1 = body2.position.y - (body1.position.y + body1.height);
		let overlapY2 = body2.position.y + body2.height - body1.position.y;

		let overlapX =
			Math.abs(overlapX1) < Math.abs(overlapX2) ? overlapX1 : overlapX2;
		let overlapY =
			Math.abs(overlapY1) < Math.abs(overlapY2) ? overlapY1 : overlapY2;

		return Vector.from({ x: overlapX, y: overlapY });
	}
}
