import { Bullet } from './bullet';
import { CollisionManager } from './collision-manager';
import { Enemy } from './enemy';
import { Input } from './input';
import { Map } from './map';
import { Player } from './player';
import { Point } from './primitives';
import { Renderer } from './renderer';
import { Updater } from './updater'; 
import { Viewport } from './viewport';

export interface Config {
	container : string;
	showAABB : boolean;
}

export class Game {
	public config : Config;
	public canvas : HTMLCanvasElement;
	public context : CanvasRenderingContext2D;
	public isRunning = false;
	public player: Player;
	public bullets: Bullet[] = [];
	public enemies: Enemy[] = [];

	public gameTime: Date;

	public map: Map;
	public input: Input;
	public viewport: Viewport;
	public renderer: Renderer;
	public updater: Updater;
	public collisions: CollisionManager;
	public mouse: Point = { x: 0, y: 0 };
	/**
	 * RequestAnimationFrame unique ID; used to cancel RAF-loop
	 * @type {number}
	 */
	private _rafId : number;

	constructor(config: Config) {
		this.config = config;
		this.canvas = <HTMLCanvasElement> document.querySelector(config.container);
		this.context = this.canvas.getContext('2d');

		this.player = new Player(this);
		this.map = new Map();
		this.input = new Input(this);
		this.viewport = new Viewport(this);
		this.renderer = new Renderer(this);
		this.updater = new Updater(this);
		this.collisions = new CollisionManager(this);
		this.enemies.push(new Enemy(this.player));
	}

	tick() : void {
		this.gameTime = new Date();

		if (this.isRunning) {
			this.renderer.render();
			this.updater.update();
		}

		this._rafId = requestAnimationFrame(this.tick.bind(this));
	}

	run() : void {
		if (this.isRunning === false) {
			this.tick();

			this.isRunning = true;
		}
	}

	stop() : void {
		if (this.isRunning) {
			cancelAnimationFrame(this._rafId);

			this.isRunning = false;
		}
	}
}

let game = new Game({
	container: '.game',
	showAABB: false
});

game.run();