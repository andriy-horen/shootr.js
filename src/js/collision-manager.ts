import { Game } from './game';
import { Physics } from './physics';

export class CollisionManager { 
	private _game : Game;

	constructor(gameInstance : Game) {
		this._game = gameInstance;
	}

	update() : void {
		this._game.enemies.forEach((enemy) => {
			this._game.bullets.forEach((bullet) => {
				Physics.collide(enemy.body, bullet.body, function () {
					enemy.damage(bullet.damageAmount, bullet.parent);

					bullet.kill();
				});
			});
		});
	}
}