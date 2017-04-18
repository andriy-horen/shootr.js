import { Game, Config } from './game';
import { Viewport } from './viewport';
import { Map } from './map';
import { Point, Vector } from './primitives';
import { Entity } from './entity';
import { Body } from './body';

export class Renderer {
	private _game : Game;

	private _tile = {
		width : 30,
		height: 30
	}


	/**
	 *	Sprites I use for a development were created by Cody Shepp for his game Dental Defender: Saga of the Candy Horde.
	 *	Please check his github repo: https://github.com/cshepp/candyjam/
	 */
	private _resources = {
		'player' : './img/player.png',
		'enemy' : './img/enemy.png',
		'bullet' : './img/bullet.png'
	}

	constructor(gameInstance: Game) {
		this._game = gameInstance;
	}

	private renderTile(pos: Point, color: string) : void {
        this._game.context.beginPath();
        this._game.context.rect(pos.x, pos.y, this._tile.width, this._tile.height);
        this._game.context.fillStyle = color;
        this._game.context.fill();
    }

    private renderTiles() : void {
        let colors = ["#785c98", "#694f88"];

        for (let x = 0; x < this._game.map.width; x += this._tile.width) {
            for (let y = 0; y < this._game.map.height; y += this._tile.height) {
                let xIndex = (x / this._tile.width) % 2;
                let yIndex = (y / this._tile.height) % 2;

                let tilePos = this.cameraOffset({x, y});

                this.renderTile(tilePos, colors[xIndex ^ yIndex]);
            }
        }
    }

    private cameraOffset(pos: Point) : Point {
        let self = this;

        return {
            x: pos.x - self._game.viewport.position.x,
            y: pos.y - self._game.viewport.position.y
        };
    }

	private renderHelper(source : string, collection : Entity[]) {
		let img = document.createElement('img');
		img.src = source;

		collection.forEach((e) => {
			let frame = e.currentAnimation.currentFrame;
			let pos = this.cameraOffset(e.body.position);

			if (this._game.config.showAABB) {
				this.renderAABB(new Body(new Vector(pos.x, pos.y), e.body.width, e.body.height));
			}

			this._game.context.drawImage(
				img,
				frame.x, frame.y,
				frame.width, frame.height,
				pos.x, pos.y,
				frame.width, frame.height
			);

		});
	}

	private renderHpBar(e: Entity) {
		let barSize = { width: 50, height: 5 };
		let ctx = this._game.context;
		let pos = this.cameraOffset(Vector.subtract(e.body.position, new Vector(5, 15)));

		ctx.beginPath();
		ctx.rect(
			pos.x,
			pos.y,
			barSize.width,
			barSize.height
		);

		var grd = ctx.createLinearGradient(pos.x, pos.y, pos.x + barSize.width, pos.y + barSize.height);
		grd.addColorStop(0, "red");
		grd.addColorStop(e.health / 100, "red");
		grd.addColorStop(e.health / 100, "black");
		grd.addColorStop(1, "black");

		ctx.fillStyle = grd;
		ctx.fill();
	}

	private renderAABB(body: Body) {
		let ctx = this._game.context;

		ctx.beginPath();
		ctx.translate(0.5, 0.5);
		ctx.rect(
			body.position.x,
			body.position.y,
			body.width,
			body.height
		);

		ctx.strokeStyle = "red";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.translate(-0.5, -0.5);
	}

	render() : void {
		this.clear();

		this.renderTiles();
		this.renderHelper(this._resources['bullet'], this._game.bullets);
		this.renderHelper(this._resources['enemy'], this._game.enemies);
		this.renderHelper(this._resources['player'], [this._game.player]);

		this._game.enemies.forEach(e => {
			this.renderHpBar(e);
		});
	}

	clear() : void {
		let w = this._game.canvas.width;
		let h = this._game.canvas.height;

		this._game.context.clearRect(0, 0, w, h);
	}
}