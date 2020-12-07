import { Game } from './game';
import { Point, Vector } from './primitives';
import { Entity } from './entity';
import { Body } from './body';

export class Renderer {
	private _game: Game;

	private _tile = {
		width: 30,
		height: 30,
	};

	/**
	 *	Sprites I use for a development were created by Cody Shepp for his game Dental Defender: Saga of the Candy Horde.
	 *	Please check his github repo: https://github.com/cshepp/candyjam/
	 */
	private _resources = {
		player: './img/player.png',
		enemy: './img/enemy.png',
		bullet: './img/bullet.png',
		wall: './img/tree-red-1.png',
	};

	constructor(gameInstance: Game) {
		this._game = gameInstance;
	}

	private renderTile(pos: Point, color: string): void {
		this._game.context.beginPath();
		this._game.context.rect(
			pos.x,
			pos.y,
			this._tile.width,
			this._tile.height
		);
		this._game.context.fillStyle = color;
		this._game.context.fill();
	}

	private renderTiles(): void {
		let colors = ['#785c98', '#694f88'];

		for (let x = 0; x < this._game.map.width; x += this._tile.width) {
			for (let y = 0; y < this._game.map.height; y += this._tile.height) {
				let xIndex = (x / this._tile.width) % 2;
				let yIndex = (y / this._tile.height) % 2;

				let tilePos = this.cameraOffset({ x, y });

				this.renderTile(tilePos, colors[xIndex ^ yIndex]);
			}
		}
	}

	private cameraOffset(pos: Point): Point {
		let self = this;

		return {
			x: pos.x - self._game.viewport.position.x,
			y: pos.y - self._game.viewport.position.y,
		};
	}

	private renderHelper(source: string, collection: Entity[]) {
		let img = document.createElement('img');
		img.src = source;

		collection.forEach((e) => {
			let frame = e.currentAnimation.currentFrame;
			let pos = this.cameraOffset(e.body.position);

			if (this._game.config.showAABB) {
				this.renderAABB(
					new Body(
						new Vector(pos.x, pos.y),
						e.body.width,
						e.body.height
					)
				);
			}

			this._game.context.drawImage(
				img,
				frame.x,
				frame.y,
				frame.width,
				frame.height,
				pos.x,
				pos.y,
				frame.width,
				frame.height
			);
		});
	}

	// todo: extract hp-bar rendering logic
	private renderHud(): void {
		let offset = 20;

		let barSize = { width: 150, height: 10 };
		let ctx = this._game.context;

		ctx.beginPath();
		ctx.rect(
			offset,
			this._game.canvas.height - offset * 1.2,
			barSize.width,
			barSize.height
		);

		var grd = ctx.createLinearGradient(
			offset,
			this._game.canvas.height - offset,
			offset + barSize.width,
			this._game.canvas.height - offset + barSize.height
		);
		grd.addColorStop(0, '#4caf50');
		grd.addColorStop(this._game.player.health / 100, '#4caf50');
		grd.addColorStop(this._game.player.health / 100, 'black');
		grd.addColorStop(1, 'black');

		ctx.fillStyle = grd;
		ctx.strokeStyle = '#182524';
		ctx.lineWidth = 1;
		ctx.fill();
		ctx.stroke();

		ctx.font = '20px Consolas';
		ctx.fillStyle = '#f6e855';
		ctx.fillText(
			this._game.score.toString(),
			offset,
			this._game.canvas.height - offset * 1.5
		);
	}

	private renderAABB(body: Body) {
		let ctx = this._game.context;

		ctx.beginPath();
		ctx.translate(0.5, 0.5);
		ctx.rect(body.position.x, body.position.y, body.width, body.height);

		ctx.strokeStyle = 'red';
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.translate(-0.5, -0.5);
	}

	render(): void {
		this.clear();

		this.renderTiles();
		this.renderHelper(this._resources['bullet'], this._game.bullets);
		this.renderHelper(this._resources['enemy'], this._game.enemies);

		this.renderHelper(this._resources['player'], [this._game.player]);
		this.renderHelper(this._resources['wall'], this._game.walls);
		this.renderHud();
	}

	clear(): void {
		let w = this._game.canvas.width;
		let h = this._game.canvas.height;

		this._game.context.clearRect(0, 0, w, h);
	}
}
