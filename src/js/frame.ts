import { Sprite } from './sprite';

export class Frame {
	public index : number = 0;
	public sprite : Sprite;

	private _length : number;
	private _row : number;

	constructor(length : number, row : number, sprite : Sprite) {
		this._length = length;
		this.sprite = sprite;

		this.sprite.offset.y = this.sprite.height * row;
	}

	next() {
		this.index = (this.index + 1) % this._length;

		this.sprite.offset.x = this.sprite.width * this.index;
	}

	reset() {
		this.index = 0;
		this.sprite.offset = { x : 0, y : 0};
	}
}