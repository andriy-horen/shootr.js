import { Body } from './body';
import { Animation } from './animation';

export abstract class Entity {
	private _health : number = 100;
	private _alive : boolean = true;
	private _attacker : Entity;

	public body : Body;
	public currentAnimation : Animation;

	get health() : number {
		return this._health;
	}

	get alive() : boolean {
		return this._alive;
	}

	private _setHealth(number: number) {
		if (this._health > 0 && this._alive) {
			this._health += number;
		}

		if (this._health <= 0) {
			this.kill();
		}
	}

	kill() {
		this._health = 0;
		this._alive = false;
	}

	damage(amount : number, attacker: Entity) : void {
		this._setHealth(-amount);

		this._attacker = attacker;
	}

	heal(amount : number) {
		this._setHealth(amount);
	}

	update() {}
}