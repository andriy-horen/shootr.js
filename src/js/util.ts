export function noop() {}

export class Util {
	static clamp(value: number, min: number, max: number): number {
		if (value > max) {
			return max;
		}
		if (value < min) {
			return min;
		}

		return value;
	}
}
