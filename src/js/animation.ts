import { Frame } from './frame';
import * as Const from './const';

export class Animation {
	public currentFrame: Frame;

	/**
	 * Number of frames per second
	 * @type {number}
	 */
	public speed: number = 0;
	/**
	 * TODO: Implement, field is not used
	 * Set to true to make animation looped, false - for one cycle only
	 * @type {boolean}
	 */
	public loop: boolean = true;

	private _lastAnimated: Date = new Date(0);
	private _row: number;
	private _length: number;

	constructor(length: number, row: number, frame: Frame) {
		this._row = row;
		this._length = length;

		this.currentFrame = frame;
		this.currentFrame.y = this._row * this.currentFrame.height;
	}

	canAnimate(time: Date): boolean {
		let animationDelta = time.getTime() - this._lastAnimated.getTime();

		return animationDelta > this.delay;
	}

	get delay(): number {
		return Const.MS_IN_SEC / this.speed;
	}

	next(): void {
		let index = this.currentFrame.index;

		index = (index + 1) % this._length;
		this.currentFrame.index = index;
		this.currentFrame.x = index * this.currentFrame.width;
	}

	update(gameTime: Date): void {
		if (this.canAnimate(gameTime)) {
			this._lastAnimated = gameTime;

			this.next();
		}
	}

	reset(): void {
		this._lastAnimated = new Date(0);
		this.currentFrame.index = 0;
		this.currentFrame.x = 0;
	}
}
