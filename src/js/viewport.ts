import { Game } from './game';
import { Map } from './map';
import { Point } from './primitives';
import { Util } from './util';

export class Viewport {
	public target: Point;
	public position: Point = { x : 0, y : 0 };

	private _game: Game;
	private _width: number;
	private _height: number;

	constructor(gameInstance: Game) {
		this._game = gameInstance;
		this._width = gameInstance.canvas.width;
		this._height = gameInstance.canvas.height;
	}

	private calculatePosition() : void {
		this.position.x = Util.clamp(this.target.x - this._width / 2, 0, this._game.map.width - this._width);
		this.position.y = Util.clamp(this.target.y - this._height / 2, 0, this._game.map.height - this._height);
	}

	update() : void {
		this.calculatePosition();
	}
}