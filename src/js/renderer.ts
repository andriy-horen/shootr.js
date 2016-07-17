import { Game, Config } from './game';
import { Viewport } from './viewport';
import { Map } from './map';
import { Point } from './point';
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
        var colors = ["#785c98", "#694f88"];

        for (var x = 0; x < this._game.map.width; x += this._tile.width) {
            for (var y = 0; y < this._game.map.height; y += this._tile.height) {
                var xIndex = (x / this._tile.width) % 2;
                var yIndex = (y / this._tile.height) % 2;

                var tilePos = this.cameraOffset({x, y});

                this.renderTile(tilePos, colors[xIndex ^ yIndex]);
            }
        }
    }

    private cameraOffset(pos: Point) : Point {
        var self = this;

        return { 
            x: pos.x - self._game.viewport.position.x,
            y: pos.y - self._game.viewport.position.y
        };
    }

	private renderHelper(source : string, collection : Entity[]) {
		let img = document.createElement('img');
		img.src = source;

		collection.forEach((e) => { 
			var sprite = e.currentAnimation.currentFrame.sprite;
			var pos = this.cameraOffset(e.body.position);

			if (this._game.config.showAABB) {
				this.renderAABB(new Body(pos, e.body.width, e.body.height));
			}
			
			this._game.context.drawImage(
				img, 
				sprite.offset.x, sprite.offset.y, 
				sprite.width, sprite.height, 
				pos.x, pos.y, 
				sprite.width, sprite.height
			);

		});
	}

	private renderAABB(body: Body) {
		var ctx = this._game.context;
		
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
	}

	clear() : void {
		let w = this._game.canvas.width;
		let h = this._game.canvas.height;

		this._game.context.clearRect(0, 0, w, h);
	}
}