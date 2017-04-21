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
				Physics.collide(enemy.body, bullet.body, () => {
					enemy.damage(bullet.damageAmount, bullet.parent);

					bullet.kill();
				});
			});

			Physics.collide(enemy.body, this._game.player.body, () => {
				enemy.hit(this._game.player);
			});
		});

		this._game.walls.forEach(w => {
			Physics.collide(this._game.player.body, w.body, () => {
				//this._game.player.body.isBlocked = true;
				let overlap = Physics.getOverlap(this._game.player.body, w.body);

				if (Math.abs(overlap.x) < Math.abs(overlap.y)) {
					this._game.player.body.position.x += overlap.x;
				} else {
					this._game.player.body.position.y += overlap.y;
				}
			});
		});

		this._game.walls.forEach(w => {
			this._game.bullets.forEach(b => {
				Physics.collide(w.body, b.body, () => {
					b.kill();
				});
			});
		})
	}
}