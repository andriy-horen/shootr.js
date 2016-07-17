import { Game } from './game';
import { Entity } from './entity';

export class Updater {
	private _game : Game;

	constructor(gameInstance : Game) {
		this._game = gameInstance;
	}

	private allEntities() : Entity[] {
		return <Entity[]> Array.prototype.concat(
			this._game.bullets,
			this._game.enemies,
			this._game.player
		);
	}

	private updateAnimations() : void {
		var entities = this.allEntities();

		entities.forEach((e)=> { e.currentAnimation.update(this._game.gameTime); });
	}

	private updateEntities() : void {
		var entities = this.allEntities();

		entities.forEach(e => { e.update(); });
	}

	private updateDead() : void {
		this._game.bullets.forEach(e => { this.removeDead(e, this._game.bullets); })
		this._game.enemies.forEach(e => { this.removeDead(e, this._game.enemies); })
	}

	private removeDead(e: Entity, collection: Entity[]) {
		if (e.alive === false) {
			var eIndex = collection.indexOf(e);

			if (eIndex > -1) {
				collection.splice(eIndex, 1);
			}
		}
	}

	update() : void {
		this.updateAnimations();
		this.updateEntities();
		this.updateDead();
		this._game.viewport.update();
		this._game.collisions.update();
		this._game.input.update();
	}
}