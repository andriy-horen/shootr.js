import { Game } from './game';
import { Point, Rect } from './primitives';

export class World {
	private _game: Game;

	public bounds: Rect;

	constructor(gameInstance: Game) {
		this._game = gameInstance;
	}
}
