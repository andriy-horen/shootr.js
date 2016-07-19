import { Game } from './game';
import { Point } from './point';
import { GenericMap as Map } from './collections';

export enum Action { 
	Up, 
	Down,
	Left,
	Right,
	Attack
}

enum Key {
	W = 87,
	A = 65,
	S = 83,
	D = 68,
	Up = 38,
	Down = 40,
	Left = 37,
	Right = 39
}

export class Input {
	private _bindings : Map<Action> = {
		[Key.W] : Action.Up,
		[Key.A] : Action.Left,
		[Key.S] : Action.Down,
		[Key.D] : Action.Right,
		[Key.Up] : Action.Up,
		[Key.Down] : Action.Down,
		[Key.Left] : Action.Left,
		[Key.Right] : Action.Right
	};

	public actions : Map<boolean> = {};
	private _game : Game;
	private _mousePos: Point = { x: 0, y: 0 };

	constructor(gameInstance : Game) {
		this._game = gameInstance;

		this._game.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
		this._game.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
		this._game.canvas.addEventListener('mousemove', this.getMousePosition.bind(this));

		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	bind(key: Key, action: Action) {
		this.unbind(key);

		this._bindings[key] = action;
	}

	unbind(key: Key) {
		if (this._bindings[key]) {
			delete this._bindings[key];
		}
	}

	private onKeyDown(e: KeyboardEvent) { 
		let action = this._bindings[e.which];

		if (action != null) {
			this.actions[action] = true;

			e.preventDefault();
		}
	}

	private onKeyUp(e: KeyboardEvent) {
		let action = this._bindings[e.which];

		if (action != null) {
			this.actions[action] = false;

			e.preventDefault();
		}
	}

	private onMouseDown(e: MouseEvent) {
		const leftButton = 0;

		this.getMousePosition(e);
		if (e.button == leftButton) {
			this.actions[Action.Attack] = true;

			e.preventDefault();
		}
	}

	private onMouseUp(e: MouseEvent) {
		const leftButton = 0;

		if (e.button == leftButton) {
			this.actions[Action.Attack] = false;

			e.preventDefault();
		}
	}

	// TODO : Needs better implementation
	private getMousePosition(e: MouseEvent) { 
		let canvasOffset = this._game.canvas.getBoundingClientRect();

		this._mousePos = {
	      x: e.clientX - canvasOffset.left,
	      y: e.clientY - canvasOffset.top
	    };

	   	this._game.mouse = {
			x: this._mousePos.x + this._game.viewport.position.x,
			y: this._mousePos.y + this._game.viewport.position.y
		}
	}

	public update() {
		this._game.mouse = {
			x: this._mousePos.x + this._game.viewport.position.x,
			y: this._mousePos.y + this._game.viewport.position.y
		}
	}
}