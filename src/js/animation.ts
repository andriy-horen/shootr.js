import { Frame } from './frame';

export class Animation {
	public currentFrame : Frame;
	public speed : number = 0;

	private _lastAnimated : Date = new Date(0);

	constructor(frame : Frame) {
		this.currentFrame = frame;
	}

	canAnimate(time : Date) : boolean {
		var diff = time.getTime() - this._lastAnimated.getTime();

		return diff > this.speed;
	}

	update(gameTime: Date) {
		if (this.canAnimate(gameTime)) {
			this._lastAnimated = gameTime;

			this.currentFrame.next();
		}
	}

	reset() {
		this._lastAnimated = new Date(0);
		this.currentFrame.reset();
	}
} 