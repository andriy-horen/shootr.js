(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
const Const = require('./const');
class Animation {
    constructor(length, row, frame) {
        this.speed = 0;
        this.loop = true;
        this._lastAnimated = new Date(0);
        this._row = row;
        this._length = length;
        this.currentFrame = frame;
        this.currentFrame.y = this._row * this.currentFrame.height;
    }
    canAnimate(time) {
        let animationDelta = time.getTime() - this._lastAnimated.getTime();
        return animationDelta > this.delay;
    }
    get delay() {
        return Const.MS_IN_SEC / this.speed;
    }
    next() {
        let index = this.currentFrame.index;
        index = (index + 1) % this._length;
        this.currentFrame.index = index;
        this.currentFrame.x = index * this.currentFrame.width;
    }
    update(gameTime) {
        if (this.canAnimate(gameTime)) {
            this._lastAnimated = gameTime;
            this.next();
        }
    }
    reset() {
        this._lastAnimated = new Date(0);
        this.currentFrame.index = 0;
        this.currentFrame.x = 0;
    }
}
exports.Animation = Animation;
},{"./const":5}],2:[function(require,module,exports){
"use strict";
const primitives_1 = require('./primitives');
class Body {
    constructor(position, width, height) {
        this.position = new primitives_1.Vector();
        this.velocity = new primitives_1.Vector();
        this.overlap = new primitives_1.Vector();
        this.position = position;
        this.width = width;
        this.height = height;
    }
    updateMovement() {
        this.position = primitives_1.Vector.add(this.position, this.velocity);
        this.speed = Math.hypot(this.velocity.x, this.velocity.y);
    }
    update() {
        this.updateMovement();
    }
}
exports.Body = Body;
},{"./primitives":14}],3:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const body_1 = require('./body');
const primitives_1 = require('./primitives');
const animation_1 = require('./animation');
const frame_1 = require('./frame');
class Bullet extends entity_1.Entity {
    constructor(position, target, parent) {
        super();
        this.speed = 10;
        this.damageAmount = 10;
        this.body = new body_1.Body(new primitives_1.Vector(), 3, 3);
        this.currentAnimation = new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 10, 10));
        this.body.position = new primitives_1.Vector(position.x, position.y);
        this.target = target;
        this.parent = parent;
        this.setVelocity(this.target);
    }
    setVelocity(position) {
        let dx = Math.abs(position.x - this.body.position.x);
        let dy = Math.abs(position.y - this.body.position.y);
        let dirX = position.x - this.body.position.x > 0 ? 1 : -1;
        let dirY = position.y - this.body.position.y > 0 ? 1 : -1;
        let x = dx * (this.speed / (dx + dy)) * dirX;
        let y = dy * (this.speed / (dx + dy)) * dirY;
        this.body.velocity = new primitives_1.Vector(x, y);
    }
    update() {
        this.body.update();
    }
}
exports.Bullet = Bullet;
},{"./animation":1,"./body":2,"./entity":7,"./frame":8,"./primitives":14}],4:[function(require,module,exports){
"use strict";
const physics_1 = require('./physics');
class CollisionManager {
    constructor(gameInstance) {
        this._game = gameInstance;
    }
    update() {
        this._game.enemies.forEach((enemy) => {
            this._game.bullets.forEach((bullet) => {
                physics_1.Physics.collide(enemy.body, bullet.body, () => {
                    enemy.damage(bullet.damageAmount, bullet.parent);
                    bullet.kill();
                    this._game.score += 10;
                });
            });
            physics_1.Physics.collide(enemy.body, this._game.player.body, () => {
                enemy.hit(this._game.player);
            });
        });
        this._game.walls.forEach(w => {
            physics_1.Physics.collide(this._game.player.body, w.body, () => {
                let overlap = physics_1.Physics.getOverlap(this._game.player.body, w.body);
                if (Math.abs(overlap.x) < Math.abs(overlap.y)) {
                    this._game.player.body.position.x += overlap.x;
                }
                else {
                    this._game.player.body.position.y += overlap.y;
                }
            });
        });
        this._game.walls.forEach(w => {
            this._game.bullets.forEach(b => {
                physics_1.Physics.collide(w.body, b.body, () => {
                    b.kill();
                });
            });
        });
    }
}
exports.CollisionManager = CollisionManager;
},{"./physics":12}],5:[function(require,module,exports){
"use strict";
exports.MS_IN_SEC = 1000;
},{}],6:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const primitives_1 = require('./primitives');
const body_1 = require('./body');
const frame_1 = require('./frame');
const animation_1 = require('./animation');
class Enemy extends entity_1.Entity {
    constructor(gameInstance, target) {
        super();
        this._animations = {
            'idle': new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'right': new animation_1.Animation(4, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'left': new animation_1.Animation(4, 1, frame_1.Frame.create(0, 0, 36, 36))
        };
        this._lastHit = new Date(0);
        this.speed = 3;
        this.dagameAmount = 5;
        this.attackSpeed = 250;
        this.body = new body_1.Body(new primitives_1.Vector(100, 100), 36, 36);
        this._game = gameInstance;
        this.target = target;
        this.animate('right');
    }
    animate(animation) {
        this.currentAnimation = this._animations[animation];
        this.currentAnimation.speed = 10;
    }
    moveTowards(position) {
        let dx = Math.abs(position.x - this.body.position.x);
        let dy = Math.abs(position.y - this.body.position.y);
        let dirX = Math.sign(position.x - this.body.position.x);
        let dirY = Math.sign(position.y - this.body.position.y);
        this.body.velocity.x = dx * (this.speed / (dx + dy)) * dirX;
        this.body.velocity.y = dy * (this.speed / (dx + dy)) * dirY;
        if (dirX > 0) {
            this.animate('right');
        }
        else {
            this.animate('left');
        }
        this.body.update();
    }
    canHit() {
        let diff = this._game.gameTime.getTime() - this._lastHit.getTime();
        return diff > this.attackSpeed;
    }
    hit(target) {
        if (this.canHit()) {
            target.damage(this.dagameAmount, this);
            this._lastHit = new Date();
        }
    }
    update() {
        this.moveTowards(this.target.body.position);
    }
}
exports.Enemy = Enemy;
},{"./animation":1,"./body":2,"./entity":7,"./frame":8,"./primitives":14}],7:[function(require,module,exports){
"use strict";
class Entity {
    constructor() {
        this._health = 100;
        this._alive = true;
    }
    get health() {
        return this._health;
    }
    get alive() {
        return this._alive;
    }
    _setHealth(number) {
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
    damage(amount, attacker) {
        this._setHealth(-amount);
        this._attacker = attacker;
    }
    heal(amount) {
        this._setHealth(amount);
    }
    update() { }
}
exports.Entity = Entity;
},{}],8:[function(require,module,exports){
"use strict";
class Frame {
    constructor() {
        this.index = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
    static create(x, y, width, height) {
        let frame = new Frame();
        frame.x = x;
        frame.y = y;
        frame.width = width;
        frame.height = height;
        frame.name = name;
        return frame;
    }
}
exports.Frame = Frame;
},{}],9:[function(require,module,exports){
"use strict";
const collision_manager_1 = require('./collision-manager');
const enemy_1 = require('./enemy');
const wall_1 = require('./wall');
const input_1 = require('./input');
const map_1 = require('./map');
const player_1 = require('./player');
const renderer_1 = require('./renderer');
const updater_1 = require('./updater');
const viewport_1 = require('./viewport');
class Game {
    constructor(config) {
        this.isRunning = false;
        this.bullets = [];
        this.enemies = [];
        this.walls = [];
        this.score = 0;
        this.mouse = { x: 0, y: 0 };
        this.config = config;
        this.canvas = document.querySelector(config.container);
        this.context = this.canvas.getContext('2d');
        this.player = new player_1.Player(this);
        this.map = new map_1.Map();
        this.input = new input_1.Input(this);
        this.viewport = new viewport_1.Viewport(this);
        this.renderer = new renderer_1.Renderer(this);
        this.updater = new updater_1.Updater(this);
        this.collisions = new collision_manager_1.CollisionManager(this);
        this.enemies.push(new enemy_1.Enemy(this, this.player));
        this.walls.push(new wall_1.Wall({ x: 350, y: 20 }));
    }
    tick() {
        this.gameTime = new Date();
        if (this.isRunning) {
            this.renderer.render();
            this.updater.update();
        }
        this._rafId = requestAnimationFrame(this.tick.bind(this));
    }
    run() {
        if (this.isRunning === false) {
            this.tick();
            this.isRunning = true;
        }
    }
    stop() {
        if (this.isRunning) {
            cancelAnimationFrame(this._rafId);
            this.isRunning = false;
        }
    }
}
exports.Game = Game;
let game = new Game({
    container: '.game',
    showAABB: false
});
game.run();
},{"./collision-manager":4,"./enemy":6,"./input":10,"./map":11,"./player":13,"./renderer":15,"./updater":16,"./viewport":18,"./wall":19}],10:[function(require,module,exports){
"use strict";
(function (Action) {
    Action[Action["Up"] = 0] = "Up";
    Action[Action["Down"] = 1] = "Down";
    Action[Action["Left"] = 2] = "Left";
    Action[Action["Right"] = 3] = "Right";
    Action[Action["Attack"] = 4] = "Attack";
})(exports.Action || (exports.Action = {}));
var Action = exports.Action;
var Key;
(function (Key) {
    Key[Key["W"] = 87] = "W";
    Key[Key["A"] = 65] = "A";
    Key[Key["S"] = 83] = "S";
    Key[Key["D"] = 68] = "D";
    Key[Key["Up"] = 38] = "Up";
    Key[Key["Down"] = 40] = "Down";
    Key[Key["Left"] = 37] = "Left";
    Key[Key["Right"] = 39] = "Right";
})(Key || (Key = {}));
class Input {
    constructor(gameInstance) {
        this._bindings = {
            [Key.W]: Action.Up,
            [Key.A]: Action.Left,
            [Key.S]: Action.Down,
            [Key.D]: Action.Right,
            [Key.Up]: Action.Up,
            [Key.Down]: Action.Down,
            [Key.Left]: Action.Left,
            [Key.Right]: Action.Right
        };
        this.actions = {};
        this._mousePos = { x: 0, y: 0 };
        this._game = gameInstance;
        this._game.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this._game.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this._game.canvas.addEventListener('mousemove', this.getMousePosition.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    bind(key, action) {
        this.unbind(key);
        this._bindings[key] = action;
    }
    unbind(key) {
        if (this._bindings[key]) {
            delete this._bindings[key];
        }
    }
    onKeyDown(e) {
        let action = this._bindings[e.which];
        if (action != null) {
            this.actions[action] = true;
            e.preventDefault();
        }
    }
    onKeyUp(e) {
        let action = this._bindings[e.which];
        if (action != null) {
            this.actions[action] = false;
            e.preventDefault();
        }
    }
    onMouseDown(e) {
        const leftButton = 0;
        this.getMousePosition(e);
        if (e.button == leftButton) {
            this.actions[Action.Attack] = true;
            e.preventDefault();
        }
    }
    onMouseUp(e) {
        const leftButton = 0;
        if (e.button == leftButton) {
            this.actions[Action.Attack] = false;
            e.preventDefault();
        }
    }
    getMousePosition(e) {
        let canvasOffset = this._game.canvas.getBoundingClientRect();
        this._mousePos = {
            x: e.clientX - canvasOffset.left,
            y: e.clientY - canvasOffset.top
        };
        this._game.mouse = {
            x: this._mousePos.x + this._game.viewport.position.x,
            y: this._mousePos.y + this._game.viewport.position.y
        };
    }
    update() {
        this._game.mouse = {
            x: this._mousePos.x + this._game.viewport.position.x,
            y: this._mousePos.y + this._game.viewport.position.y
        };
    }
}
exports.Input = Input;
},{}],11:[function(require,module,exports){
"use strict";
class Map {
    constructor() {
        this.width = 2000;
        this.height = 1500;
    }
}
exports.Map = Map;
},{}],12:[function(require,module,exports){
"use strict";
const primitives_1 = require('./primitives');
class Physics {
    static intersects(body1, body2) {
        let intersectionX = body1.position.x < body2.position.x + body2.width
            && body1.position.x + body1.width > body2.position.x;
        let intersectionY = body1.position.y < body2.position.y + body2.height
            && body1.position.y + body1.height > body2.position.y;
        return intersectionX && intersectionY;
    }
    static collide(body1, body2, collisionCallback) {
        if (this.intersects(body1, body2)) {
            collisionCallback();
            return true;
        }
        return false;
    }
    static getOverlap(body1, body2) {
        if (this.intersects(body1, body2) === false) {
            return primitives_1.Vector.from({ x: 0, y: 0 });
        }
        let overlapX1 = body2.position.x - (body1.position.x + body1.width);
        let overlapX2 = (body2.position.x + body2.width) - body1.position.x;
        let overlapY1 = body2.position.y - (body1.position.y + body1.height);
        let overlapY2 = (body2.position.y + body2.height) - body1.position.y;
        let overlapX = Math.abs(overlapX1) < Math.abs(overlapX2) ? overlapX1 : overlapX2;
        let overlapY = Math.abs(overlapY1) < Math.abs(overlapY2) ? overlapY1 : overlapY2;
        return primitives_1.Vector.from({ x: overlapX, y: overlapY });
    }
}
exports.Physics = Physics;
},{"./primitives":14}],13:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const primitives_1 = require('./primitives');
const input_1 = require('./input');
const body_1 = require('./body');
const bullet_1 = require('./bullet');
const frame_1 = require('./frame');
const animation_1 = require('./animation');
class Player extends entity_1.Entity {
    constructor(gameInstance) {
        super();
        this._lastShot = new Date(0);
        this.body = new body_1.Body(new primitives_1.Vector(10, 10), 36, 36);
        this.speed = 3;
        this.attackSpeed = 150;
        this._animations = {
            'idle': new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'right': new animation_1.Animation(4, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'left': new animation_1.Animation(4, 1, frame_1.Frame.create(0, 0, 36, 36))
        };
        this._bulletOffset = { x: 12, y: 18 };
        this._game = gameInstance;
        this.animate('idle');
    }
    shoot() {
        if (this.canShoot()) {
            this._lastShot = new Date();
            let bulletSpawn = Object.assign({}, {
                x: this.body.position.x + this._bulletOffset.x,
                y: this.body.position.y + this._bulletOffset.y
            });
            let bullet = new bullet_1.Bullet(bulletSpawn, this._game.mouse, this);
            this._game.bullets.push(bullet);
        }
    }
    canShoot() {
        let diff = this._game.gameTime.getTime() - this._lastShot.getTime();
        return diff > this.attackSpeed;
    }
    animate(animation) {
        this.currentAnimation = this._animations[animation];
        this.currentAnimation.speed = 10;
    }
    upateMovement() {
        let input = this._game.input;
        let movingX = input.actions[input_1.Action.Left] || input.actions[input_1.Action.Right];
        let movingY = input.actions[input_1.Action.Up] || input.actions[input_1.Action.Down];
        let speed = movingX && movingY ? Math.sqrt(this.speed * this.speed / 2) : this.speed;
        let direction = new primitives_1.Vector();
        direction.x = input.actions[input_1.Action.Left] ? -1 : 1,
            direction.y = input.actions[input_1.Action.Up] ? -1 : 1;
        direction.x = movingX ? direction.x : 0;
        direction.y = movingY ? direction.y : 0;
        this.body.velocity.x = direction.x * speed;
        this.body.velocity.y = direction.y * speed;
        console.log("Player speed: " + this.body.speed);
        this.body.update();
        if (input.actions[input_1.Action.Attack]) {
            this.shoot();
        }
    }
    updateAnimation() {
        let animation = this._game.mouse.x > this.body.position.x ? 'right' : 'left';
        this.animate(animation);
    }
    update() {
        if (this.alive) {
            this.upateMovement();
            this.updateAnimation();
        }
    }
}
exports.Player = Player;
},{"./animation":1,"./body":2,"./bullet":3,"./entity":7,"./frame":8,"./input":10,"./primitives":14}],14:[function(require,module,exports){
"use strict";
class Vector {
    constructor(x = 0, y = 0) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    set(value) {
        if (typeof value === "number") {
            this.x = this.y = value;
        }
        else {
            this.x = value.x;
            this.y = value.y;
        }
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    static add(vec1, vec2) {
        return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
    }
    static subtract(vec1, vec2) {
        return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
    }
    static multiply(vec, scalar) {
        return new Vector(vec.x * scalar, vec.y * scalar);
    }
    static from(point) {
        return new Vector(point.x, point.y);
    }
}
exports.Vector = Vector;
},{}],15:[function(require,module,exports){
"use strict";
const primitives_1 = require('./primitives');
const body_1 = require('./body');
class Renderer {
    constructor(gameInstance) {
        this._tile = {
            width: 30,
            height: 30
        };
        this._resources = {
            'player': './img/player.png',
            'enemy': './img/enemy.png',
            'bullet': './img/bullet.png',
            'wall': './img/tree-red-1.png'
        };
        this._game = gameInstance;
    }
    renderTile(pos, color) {
        this._game.context.beginPath();
        this._game.context.rect(pos.x, pos.y, this._tile.width, this._tile.height);
        this._game.context.fillStyle = color;
        this._game.context.fill();
    }
    renderTiles() {
        let colors = ["#785c98", "#694f88"];
        for (let x = 0; x < this._game.map.width; x += this._tile.width) {
            for (let y = 0; y < this._game.map.height; y += this._tile.height) {
                let xIndex = (x / this._tile.width) % 2;
                let yIndex = (y / this._tile.height) % 2;
                let tilePos = this.cameraOffset({ x: x, y: y });
                this.renderTile(tilePos, colors[xIndex ^ yIndex]);
            }
        }
    }
    cameraOffset(pos) {
        let self = this;
        return {
            x: pos.x - self._game.viewport.position.x,
            y: pos.y - self._game.viewport.position.y
        };
    }
    renderHelper(source, collection) {
        let img = document.createElement('img');
        img.src = source;
        collection.forEach((e) => {
            let frame = e.currentAnimation.currentFrame;
            let pos = this.cameraOffset(e.body.position);
            if (this._game.config.showAABB) {
                this.renderAABB(new body_1.Body(new primitives_1.Vector(pos.x, pos.y), e.body.width, e.body.height));
            }
            this._game.context.drawImage(img, frame.x, frame.y, frame.width, frame.height, pos.x, pos.y, frame.width, frame.height);
        });
    }
    renderHpBar(e) {
        let barSize = { width: 50, height: 5 };
        let ctx = this._game.context;
        let pos = this.cameraOffset(primitives_1.Vector.subtract(e.body.position, new primitives_1.Vector(5, 15)));
        ctx.beginPath();
        ctx.rect(pos.x, pos.y, barSize.width, barSize.height);
        var grd = ctx.createLinearGradient(pos.x, pos.y, pos.x + barSize.width, pos.y + barSize.height);
        grd.addColorStop(0, "red");
        grd.addColorStop(e.health / 100, "red");
        grd.addColorStop(e.health / 100, "black");
        grd.addColorStop(1, "black");
        ctx.fillStyle = grd;
        ctx.fill();
    }
    renderHud() {
        let offset = 20;
        let barSize = { width: 150, height: 10 };
        let ctx = this._game.context;
        ctx.beginPath();
        ctx.rect(offset, this._game.canvas.height - offset * 1.2, barSize.width, barSize.height);
        var grd = ctx.createLinearGradient(offset, this._game.canvas.height - offset, offset + barSize.width, this._game.canvas.height - offset + barSize.height);
        grd.addColorStop(0, "#4caf50");
        grd.addColorStop(this._game.player.health / 100, "#4caf50");
        grd.addColorStop(this._game.player.health / 100, "black");
        grd.addColorStop(1, "black");
        ctx.fillStyle = grd;
        ctx.strokeStyle = "#182524";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.font = '20px Consolas';
        ctx.fillStyle = "#f6e855";
        ctx.fillText(this._game.score.toString(), offset, this._game.canvas.height - offset * 1.5);
    }
    renderAABB(body) {
        let ctx = this._game.context;
        ctx.beginPath();
        ctx.translate(0.5, 0.5);
        ctx.rect(body.position.x, body.position.y, body.width, body.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.translate(-0.5, -0.5);
    }
    render() {
        this.clear();
        this.renderTiles();
        this.renderHelper(this._resources['bullet'], this._game.bullets);
        this.renderHelper(this._resources['enemy'], this._game.enemies);
        this._game.enemies.forEach(e => {
            this.renderHpBar(e);
        });
        this.renderHelper(this._resources['player'], [this._game.player]);
        this.renderHelper(this._resources['wall'], this._game.walls);
        this.renderHud();
    }
    clear() {
        let w = this._game.canvas.width;
        let h = this._game.canvas.height;
        this._game.context.clearRect(0, 0, w, h);
    }
}
exports.Renderer = Renderer;
},{"./body":2,"./primitives":14}],16:[function(require,module,exports){
"use strict";
class Updater {
    constructor(gameInstance) {
        this._game = gameInstance;
    }
    allEntities() {
        return Array.prototype.concat(this._game.bullets, this._game.enemies, this._game.player);
    }
    updateAnimations() {
        let entities = this.allEntities();
        entities.forEach((e) => { e.currentAnimation.update(this._game.gameTime); });
    }
    updateEntities() {
        let entities = this.allEntities();
        entities.forEach(e => { e.update(); });
    }
    updateDead() {
        this._game.bullets.forEach(e => { this.removeDead(e, this._game.bullets); });
        this._game.enemies.forEach(e => { this.removeDead(e, this._game.enemies); });
    }
    removeDead(e, collection) {
        if (e.alive === false) {
            let eIndex = collection.indexOf(e);
            if (eIndex > -1) {
                collection.splice(eIndex, 1);
            }
        }
    }
    update() {
        this.updateAnimations();
        this.updateEntities();
        this.updateDead();
        this._game.viewport.target = this._game.player.body.position;
        this._game.viewport.update();
        this._game.collisions.update();
        this._game.input.update();
    }
}
exports.Updater = Updater;
},{}],17:[function(require,module,exports){
"use strict";
function noop() { }
exports.noop = noop;
;
class Util {
    static clamp(value, min, max) {
        if (value > max) {
            return max;
        }
        if (value < min) {
            return min;
        }
        return value;
    }
}
exports.Util = Util;
},{}],18:[function(require,module,exports){
"use strict";
const util_1 = require('./util');
class Viewport {
    constructor(gameInstance) {
        this.position = { x: 0, y: 0 };
        this._game = gameInstance;
        this._width = gameInstance.canvas.width;
        this._height = gameInstance.canvas.height;
    }
    calculatePosition() {
        this.position.x = util_1.Util.clamp(this.target.x - this._width / 2, 0, this._game.map.width - this._width);
        this.position.y = util_1.Util.clamp(this.target.y - this._height / 2, 0, this._game.map.height - this._height);
    }
    update() {
        this.calculatePosition();
    }
}
exports.Viewport = Viewport;
},{"./util":17}],19:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const animation_1 = require('./animation');
const frame_1 = require('./frame');
const body_1 = require('./body');
const primitives_1 = require('./primitives');
class Wall extends entity_1.Entity {
    constructor(position) {
        super();
        this.body = new body_1.Body(new primitives_1.Vector(), 151, 211);
        this.currentAnimation = new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 151, 211));
        this.body.position = primitives_1.Vector.from(position);
    }
}
exports.Wall = Wall;
},{"./animation":1,"./body":2,"./entity":7,"./frame":8,"./primitives":14}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JlbmRlcmVyLnRzIiwic3JjL2pzL3VwZGF0ZXIudHMiLCJzcmMvanMvdXRpbC50cyIsInNyYy9qcy92aWV3cG9ydC50cyIsInNyYy9qcy93YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0NBLE1BQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBRWpDO0lBbUJDLFlBQVksTUFBYyxFQUFFLEdBQVcsRUFBRSxLQUFZO1FBWjlDLFVBQUssR0FBWSxDQUFDLENBQUM7UUFNbkIsU0FBSSxHQUFZLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDNUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFXO1FBQ3JCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFP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QUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFLcEYsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZTtRQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzdDLElBQUks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QU8sQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFFRCxNQUFNO1FBQ0wsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDMUIsQ0FBQztBQUNGLENBQUM7QUF0QlksZ0JBQVEsV0FzQnBCLENBQUE7OztBQzNCRCx5QkFBdUIsVUFBVSxDQUFDLENBQUE7QUFDbEMsNEJBQTBCLGFBQWEsQ0FBQyxDQUFBO0FBQ3hDLHdCQUFzQixTQUFTLENBQUMsQ0FBQTtBQUNoQyx1QkFBcUIsUUFBUSxDQUFDLENBQUE7QUFDOUIsNkJBQThCLGNBQWMsQ0FBQyxDQUFBO0FBRTdDLG1CQUEwQixlQUFNO0lBSTVCLFlBQVksUUFBZTtRQUN2QixPQUFPLENBQUM7UUFKTCxTQUFJLEdBQVUsSUFBSSxXQUFJLENBQUMsSUFBSSxtQkFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELHFCQUFnQixHQUFjLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUloRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0FBQ0wsQ0FBQztBQVJZLFlBQUksT0FRaEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgKiBhcyBDb25zdCBmcm9tICcuL2NvbnN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xyXG5cdHB1YmxpYyBjdXJyZW50RnJhbWUgOiBGcmFtZTtcclxuXHJcblx0LyoqXHJcblx0ICogTnVtYmVyIG9mIGZyYW1lcyBwZXIgc2Vjb25kXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAwO1xyXG5cdC8qKlxyXG5cdCAqIFRPRE86IEltcGxlbWVudCwgZmllbGQgaXMgbm90IHVzZWQgXHJcblx0ICogU2V0IHRvIHRydWUgdG8gbWFrZSBhbmltYXRpb24gbG9vcGVkLCBmYWxzZSAtIGZvciBvbmUgY3ljbGUgb25seVxyXG5cdCAqIEB0eXBlIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsb29wOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcblx0cHJpdmF0ZSBfbGFzdEFuaW1hdGVkIDogRGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cdHByaXZhdGUgX3JvdyA6IG51bWJlcjtcclxuXHRwcml2YXRlIF9sZW5ndGggOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGxlbmd0aDogbnVtYmVyLCByb3c6IG51bWJlciwgZnJhbWU6IEZyYW1lKSB7XHJcblx0XHR0aGlzLl9yb3cgPSByb3c7XHJcblx0XHR0aGlzLl9sZW5ndGggPSBsZW5ndGg7XHJcblxyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLnkgPSB0aGlzLl9yb3cgKiB0aGlzLmN1cnJlbnRGcmFtZS5oZWlnaHQ7XHJcblx0fVxyXG5cclxuXHRjYW5BbmltYXRlKHRpbWUgOiBEYXRlKSA6IGJvb2xlYW4ge1xyXG5cdFx0bGV0IGFuaW1hdGlvbkRlbHRhID0gdGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0QW5pbWF0ZWQuZ2V0VGltZSgpO1xyXG5cclxuXHRcdHJldHVybiBhbmltYXRpb25EZWx0YSA+IHRoaXMuZGVsYXk7XHJcblx0fVxyXG5cclxuXHRnZXQgZGVsYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBDb25zdC5NU19JTl9TRUMgLyB0aGlzLnNwZWVkO1xyXG5cdH1cclxuXHJcblx0bmV4dCgpOiB2b2lkIHtcclxuXHRcdGxldCBpbmRleCA9IHRoaXMuY3VycmVudEZyYW1lLmluZGV4O1xyXG5cclxuXHRcdGluZGV4ID0gKGluZGV4ICsgMSkgJSB0aGlzLl9sZW5ndGg7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5pbmRleCA9IGluZGV4O1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IGluZGV4ICogdGhpcy5jdXJyZW50RnJhbWUud2lkdGg7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoZ2FtZVRpbWU6IERhdGUpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmNhbkFuaW1hdGUoZ2FtZVRpbWUpKSB7XHJcblx0XHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IGdhbWVUaW1lO1xyXG5cclxuXHRcdFx0dGhpcy5uZXh0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IG5ldyBEYXRlKDApO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUuaW5kZXggPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IDA7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL3dvcmxkJztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvZHkge1xyXG5cdHBvc2l0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XHJcblx0dmVsb2NpdHk6IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcclxuXHRvdmVybGFwOiBWZWN0b3IgPSAgbmV3IFZlY3RvcigpOyBcclxuXHRzcGVlZCA6IG51bWJlcjtcclxuXHR3aWR0aCA6IG51bWJlcjtcclxuXHRoZWlnaHQgOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE86IE5lZWRzIHRvIGJlIGltcHJvdmVkIGJlYWNhdXNlIG1vcmUgRlBTIHJlc3VsdHMgaW4gZmFzdGVyIG1vdmVtZW50O1xyXG5cdHByaXZhdGUgdXBkYXRlTW92ZW1lbnQoKTp2b2lkIHtcclxuXHRcdHRoaXMucG9zaXRpb24gPSBWZWN0b3IuYWRkKHRoaXMucG9zaXRpb24sIHRoaXMudmVsb2NpdHkpO1xyXG5cclxuXHRcdHRoaXMuc3BlZWQgPSBNYXRoLmh5cG90KHRoaXMudmVsb2NpdHkueCwgdGhpcy52ZWxvY2l0eS55KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdHRoaXMudXBkYXRlTW92ZW1lbnQoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVsbGV0IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwdWJsaWMgdGFyZ2V0IDogUG9pbnQ7XHJcblx0cHVibGljIHBhcmVudCA6IEVudGl0eTtcclxuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAxMDtcclxuXHRwdWJsaWMgZGFtYWdlQW1vdW50IDogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigpLCAzLCAzKTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTAsIDEwKSk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCwgdGFyZ2V0OiBQb2ludCwgcGFyZW50IDogRW50aXR5KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuYm9keS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG5cclxuXHRcdHRoaXMuc2V0VmVsb2NpdHkodGhpcy50YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRWZWxvY2l0eShwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgbGV0IGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xyXG5cclxuICAgICAgICBsZXQgeCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcclxuICAgICAgICBsZXQgeSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih4LCB5KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLmJvZHkudXBkYXRlKCk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBQaHlzaWNzIH0gZnJvbSAnLi9waHlzaWNzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25NYW5hZ2VyIHsgXHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKChidWxsZXQpID0+IHtcclxuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUoZW5lbXkuYm9keSwgYnVsbGV0LmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRcdGVuZW15LmRhbWFnZShidWxsZXQuZGFtYWdlQW1vdW50LCBidWxsZXQucGFyZW50KTtcclxuXHJcblx0XHRcdFx0XHRidWxsZXQua2lsbCgpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX2dhbWUuc2NvcmUgKz0gMTA7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0UGh5c2ljcy5jb2xsaWRlKGVuZW15LmJvZHksIHRoaXMuX2dhbWUucGxheWVyLmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRlbmVteS5oaXQodGhpcy5fZ2FtZS5wbGF5ZXIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUud2FsbHMuZm9yRWFjaCh3ID0+IHtcclxuXHRcdFx0UGh5c2ljcy5jb2xsaWRlKHRoaXMuX2dhbWUucGxheWVyLmJvZHksIHcuYm9keSwgKCkgPT4ge1xyXG5cdFx0XHRcdC8vdGhpcy5fZ2FtZS5wbGF5ZXIuYm9keS5pc0Jsb2NrZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGxldCBvdmVybGFwID0gUGh5c2ljcy5nZXRPdmVybGFwKHRoaXMuX2dhbWUucGxheWVyLmJvZHksIHcuYm9keSk7XHJcblxyXG5cdFx0XHRcdGlmIChNYXRoLmFicyhvdmVybGFwLngpIDwgTWF0aC5hYnMob3ZlcmxhcC55KSkge1xyXG5cdFx0XHRcdFx0dGhpcy5fZ2FtZS5wbGF5ZXIuYm9keS5wb3NpdGlvbi54ICs9IG92ZXJsYXAueDtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhpcy5fZ2FtZS5wbGF5ZXIuYm9keS5wb3NpdGlvbi55ICs9IG92ZXJsYXAueTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZS53YWxscy5mb3JFYWNoKHcgPT4ge1xyXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaChiID0+IHtcclxuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUody5ib2R5LCBiLmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRcdGIua2lsbCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pXHJcblx0fVxyXG59IiwiZXhwb3J0IGNvbnN0IE1TX0lOX1NFQyA9IDEwMDA7XHJcbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XHJcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XHJcblx0XHRcdCdpZGxlJyA6IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxyXG5cdFx0XHQncmlnaHQnIDogbmV3IEFuaW1hdGlvbig0LCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRcdCdsZWZ0JyA6IG5ldyBBbmltYXRpb24oNCwgMSwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfbGFzdEhpdDogRGF0ZSA9IG5ldyBEYXRlKDApO1xyXG4gICAgcHJpdmF0ZSBfZ2FtZTogR2FtZTtcclxuXHJcblxyXG4gICAgcHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XHJcbiAgICBwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAzO1xyXG4gICAgcHVibGljIGRhZ2FtZUFtb3VudDogbnVtYmVyID0gNTtcclxuICAgIHB1YmxpYyBhdHRhY2tTcGVlZDogbnVtYmVyID0gMjUwO1xyXG4gICAgcHVibGljIHRhcmdldCA6IEVudGl0eTtcclxuICAgIHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoMTAwLCAxMDApLCAzNiwgMzYpO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUsIHRhcmdldDogRW50aXR5KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cclxuXHRcdHRoaXMuYW5pbWF0ZSgncmlnaHQnKTtcclxuXHR9XHJcblxyXG5cdGFuaW1hdGUoYW5pbWF0aW9uIDogc3RyaW5nKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTA7XHJcblx0fVxyXG5cclxuICAgIC8vIFRPRE8gOiBpbnZlc3RpZ2F0ZSBpc3N1ZSB3aXRoIGRpYWdvbmFsIHNwZWVkLiB+Mi4xMiB3aGVuIGlzIHN1cHBvc2VkIHRvIGJlIDNcclxuXHRtb3ZlVG93YXJkcyhwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyWCA9IE1hdGguc2lnbihwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xyXG4gICAgICAgIGxldCBkaXJZID0gTWF0aC5zaWduKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xyXG5cclxuICAgICAgICBpZiAoZGlyWCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgnbGVmdCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cdH1cclxuXHJcbiAgICBwcml2YXRlIGNhbkhpdCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZGlmZiA9IHRoaXMuX2dhbWUuZ2FtZVRpbWUuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdEhpdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIGhpdCh0YXJnZXQ6IEVudGl0eSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbkhpdCgpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldC5kYW1hZ2UodGhpcy5kYWdhbWVBbW91bnQsIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fbGFzdEhpdCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5tb3ZlVG93YXJkcyh0aGlzLnRhcmdldC5ib2R5LnBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkVuZW15IHNwZWVkOiBcIiArIHRoaXMuYm9keS5zcGVlZCk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5IHtcclxuXHRwcml2YXRlIF9oZWFsdGggOiBudW1iZXIgPSAxMDA7XHJcblx0cHJpdmF0ZSBfYWxpdmUgOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwcml2YXRlIF9hdHRhY2tlciA6IEVudGl0eTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5O1xyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cclxuXHRnZXQgaGVhbHRoKCkgOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2hlYWx0aDtcclxuXHR9XHJcblxyXG5cdGdldCBhbGl2ZSgpIDogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYWxpdmU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9zZXRIZWFsdGgobnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdGlmICh0aGlzLl9oZWFsdGggPiAwICYmIHRoaXMuX2FsaXZlKSB7XHJcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XHJcblx0XHRcdHRoaXMua2lsbCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0a2lsbCgpIHtcclxuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XHJcblx0XHR0aGlzLl9hbGl2ZSA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0ZGFtYWdlKGFtb3VudCA6IG51bWJlciwgYXR0YWNrZXI6IEVudGl0eSkgOiB2b2lkIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aCgtYW1vdW50KTtcclxuXHJcblx0XHR0aGlzLl9hdHRhY2tlciA9IGF0dGFja2VyO1xyXG5cdH1cclxuXHJcblx0aGVhbChhbW91bnQgOiBudW1iZXIpIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aChhbW91bnQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge31cclxufSIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZSB7XHJcblx0aW5kZXggOiBudW1iZXIgPSAwO1xyXG5cdHg6IG51bWJlciA9IDA7XHJcblx0eTogbnVtYmVyID0gMDtcclxuXHR3aWR0aDogbnVtYmVyID0gMDtcclxuXHRoZWlnaHQ6IG51bWJlciA9IDA7XHJcblx0bmFtZSA6IHN0cmluZztcclxuXHJcblx0c3RhdGljIGNyZWF0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBGcmFtZSB7XHJcblx0XHRsZXQgZnJhbWUgPSBuZXcgRnJhbWUoKTtcclxuXHJcblx0XHRmcmFtZS54ID0geDtcclxuXHRcdGZyYW1lLnkgPSB5O1xyXG5cdFx0ZnJhbWUud2lkdGggPSB3aWR0aDtcclxuXHRcdGZyYW1lLmhlaWdodCA9IGhlaWdodDtcclxuXHRcdGZyYW1lLm5hbWUgPSBuYW1lO1xyXG5cclxuXHRcdHJldHVybiBmcmFtZTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBDb2xsaXNpb25NYW5hZ2VyIH0gZnJvbSAnLi9jb2xsaXNpb24tbWFuYWdlcic7XHJcbmltcG9ydCB7IEVuZW15IH0gZnJvbSAnLi9lbmVteSc7XHJcbmltcG9ydCB7IFdhbGwgfSBmcm9tICcuL3dhbGwnO1xyXG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XHJcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJy4vcGxheWVyJztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyZXInO1xyXG5pbXBvcnQgeyBVcGRhdGVyIH0gZnJvbSAnLi91cGRhdGVyJzsgXHJcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XHJcblx0Y29udGFpbmVyIDogc3RyaW5nO1xyXG5cdHNob3dBQUJCIDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG5cdHB1YmxpYyBjb25maWcgOiBDb25maWc7XHJcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cdHB1YmxpYyBpc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XHJcblx0cHVibGljIGJ1bGxldHM6IEJ1bGxldFtdID0gW107XHJcblx0cHVibGljIGVuZW1pZXM6IEVuZW15W10gPSBbXTtcclxuXHRwdWJsaWMgd2FsbHM6IFdhbGxbXSA9IFtdO1xyXG5cclxuXHRwdWJsaWMgZ2FtZVRpbWU6IERhdGU7XHJcblx0cHVibGljIHNjb3JlOiBudW1iZXIgPSAwO1xyXG5cclxuXHRwdWJsaWMgbWFwOiBNYXA7XHJcblx0cHVibGljIGlucHV0OiBJbnB1dDtcclxuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xyXG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XHJcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XHJcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XHJcblx0cHVibGljIG1vdXNlOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG5cdC8qKlxyXG5cdCAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSB1bmlxdWUgSUQ7IHVzZWQgdG8gY2FuY2VsIFJBRi1sb29wXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRwcml2YXRlIF9yYWZJZCA6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcclxuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdFx0dGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29uZmlnLmNvbnRhaW5lcik7XHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHRcdHRoaXMucGxheWVyID0gbmV3IFBsYXllcih0aGlzKTtcclxuXHRcdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG5cdFx0dGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzKTtcclxuXHRcdHRoaXMudmlld3BvcnQgPSBuZXcgVmlld3BvcnQodGhpcyk7XHJcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHRoaXMpO1xyXG5cdFx0dGhpcy51cGRhdGVyID0gbmV3IFVwZGF0ZXIodGhpcyk7XHJcblx0XHR0aGlzLmNvbGxpc2lvbnMgPSBuZXcgQ29sbGlzaW9uTWFuYWdlcih0aGlzKTtcclxuXHRcdHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCB0aGlzLnBsYXllcikpO1xyXG5cdFx0dGhpcy53YWxscy5wdXNoKG5ldyBXYWxsKHsgeDogMzUwLCB5OiAyMCB9KSk7XHJcblx0fVxyXG5cclxuXHR0aWNrKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0cnVuKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcclxuXHRcdFx0dGhpcy50aWNrKCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdG9wKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubGV0IGdhbWUgPSBuZXcgR2FtZSh7XHJcblx0Y29udGFpbmVyOiAnLmdhbWUnLFxyXG5cdHNob3dBQUJCOiBmYWxzZVxyXG59KTtcclxuXHJcbmdhbWUucnVuKCk7IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuXHJcbmV4cG9ydCBlbnVtIEFjdGlvbiB7IFxyXG5cdFVwLCBcclxuXHREb3duLFxyXG5cdExlZnQsXHJcblx0UmlnaHQsXHJcblx0QXR0YWNrXHJcbn1cclxuXHJcbmVudW0gS2V5IHtcclxuXHRXID0gODcsXHJcblx0QSA9IDY1LFxyXG5cdFMgPSA4MyxcclxuXHREID0gNjgsXHJcblx0VXAgPSAzOCxcclxuXHREb3duID0gNDAsXHJcblx0TGVmdCA9IDM3LFxyXG5cdFJpZ2h0ID0gMzlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0IHtcclxuXHRwcml2YXRlIF9iaW5kaW5ncyA6IE1hcDxBY3Rpb24+ID0ge1xyXG5cdFx0W0tleS5XXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuQV0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuU10gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuRF0gOiBBY3Rpb24uUmlnaHQsXHJcblx0XHRbS2V5LlVwXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuRG93bl0gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuTGVmdF0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuUmlnaHRdIDogQWN0aW9uLlJpZ2h0XHJcblx0fTtcclxuXHJcblx0cHVibGljIGFjdGlvbnMgOiBNYXA8Ym9vbGVhbj4gPSB7fTtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9tb3VzZVBvczogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0YmluZChrZXk6IEtleSwgYWN0aW9uOiBBY3Rpb24pIHtcclxuXHRcdHRoaXMudW5iaW5kKGtleSk7XHJcblxyXG5cdFx0dGhpcy5fYmluZGluZ3Nba2V5XSA9IGFjdGlvbjtcclxuXHR9XHJcblxyXG5cdHVuYmluZChrZXk6IEtleSkge1xyXG5cdFx0aWYgKHRoaXMuX2JpbmRpbmdzW2tleV0pIHtcclxuXHRcdFx0ZGVsZXRlIHRoaXMuX2JpbmRpbmdzW2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7IFxyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IHRydWU7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5VXAoZTogS2V5Ym9hcmRFdmVudCkge1xyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XHJcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcclxuXHJcblx0XHR0aGlzLmdldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlVXAoZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gZmFsc2U7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIDogTmVlZHMgYmV0dGVyIGltcGxlbWVudGF0aW9uXHJcblx0cHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGU6IE1vdXNlRXZlbnQpIHsgXHJcblx0XHRsZXQgY2FudmFzT2Zmc2V0ID0gdGhpcy5fZ2FtZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XHJcblx0ICAgICAgeDogZS5jbGllbnRYIC0gY2FudmFzT2Zmc2V0LmxlZnQsXHJcblx0ICAgICAgeTogZS5jbGllbnRZIC0gY2FudmFzT2Zmc2V0LnRvcFxyXG5cdCAgICB9O1xyXG5cclxuXHQgICBcdHRoaXMuX2dhbWUubW91c2UgPSB7XHJcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXHJcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZXhwb3J0IGNsYXNzIE1hcCB7IFxyXG5cdHB1YmxpYyB3aWR0aCA6IG51bWJlciA9IDIwMDA7XHJcblx0cHVibGljIGhlaWdodCA6IG51bWJlciA9IDE1MDA7XHJcbn0iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XHJcblx0IC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHR3byByZWN0YW5ndWxhciBib2RpZXMgaW50ZXJzZWN0XHJcbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MSBGaXJzdCBib2R5IHdpdGgge3gseX0gcG9zaXRpb24gYW5kIHt3aWR0aCwgaGVpZ2h0fVxyXG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTIgU2Vjb25kIGJvZHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhleSBpbnRlcnNlY3QsIG90aGVyd2lzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhib2R5MTogQm9keSwgYm9keTI6IEJvZHkpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblggPSBib2R5MS5wb3NpdGlvbi54IDwgYm9keTIucG9zaXRpb24ueCArIGJvZHkyLndpZHRoIFxyXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblkgPSBib2R5MS5wb3NpdGlvbi55IDwgYm9keTIucG9zaXRpb24ueSArIGJvZHkyLmhlaWdodCBcclxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblggJiYgaW50ZXJzZWN0aW9uWTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY29sbGlkZShib2R5MTogQm9keSwgYm9keTI6IEJvZHksIGNvbGxpc2lvbkNhbGxiYWNrOiBGdW5jdGlvbikgOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcclxuICAgICAgICAgICAgY29sbGlzaW9uQ2FsbGJhY2soKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRPdmVybGFwKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSk6IFZlY3RvciB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhib2R5MSwgYm9keTIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVmVjdG9yLmZyb20oeyB4OiAwLCB5OiAwIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG92ZXJsYXBYMSA9IGJvZHkyLnBvc2l0aW9uLnggLSAoYm9keTEucG9zaXRpb24ueCArIGJvZHkxLndpZHRoKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcFgyID0gKGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCkgLSBib2R5MS5wb3NpdGlvbi54O1xyXG5cclxuICAgICAgICBsZXQgb3ZlcmxhcFkxID0gYm9keTIucG9zaXRpb24ueSAtIChib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0KTtcclxuICAgICAgICBsZXQgb3ZlcmxhcFkyID0gKGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQpIC0gYm9keTEucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgbGV0IG92ZXJsYXBYID0gTWF0aC5hYnMob3ZlcmxhcFgxKSA8IE1hdGguYWJzKG92ZXJsYXBYMikgPyBvdmVybGFwWDEgOiBvdmVybGFwWDI7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBZID0gTWF0aC5hYnMob3ZlcmxhcFkxKSA8IE1hdGguYWJzKG92ZXJsYXBZMikgPyBvdmVybGFwWTEgOiBvdmVybGFwWTI7XHJcblxyXG4gICAgICAgIHJldHVybiBWZWN0b3IuZnJvbSh7IHg6IG92ZXJsYXBYLCB5OiBvdmVybGFwWSB9KTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJy4vdXRpbCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigxMCwgMTApLCAzNiwgMzYpO1xyXG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMztcclxuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XHJcblxyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcclxuXHQgICAgJ2lkbGUnIDogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcclxuXHR9O1xyXG5cdHByaXZhdGUgX2J1bGxldE9mZnNldCA6IFBvaW50ID0geyB4OiAxMiwgeTogMTggfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xyXG5cdH1cclxuXHJcblx0c2hvb3QoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIHsgXHJcblx0XHRcdFx0eDogdGhpcy5ib2R5LnBvc2l0aW9uLnggKyB0aGlzLl9idWxsZXRPZmZzZXQueCwgXHJcblx0XHRcdFx0eTogdGhpcy5ib2R5LnBvc2l0aW9uLnkgKyB0aGlzLl9idWxsZXRPZmZzZXQueSBcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRTcGF3biwgdGhpcy5fZ2FtZS5tb3VzZSwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhblNob290KCkgOiBib29sZWFuIHtcclxuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb24gOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGF0ZU1vdmVtZW50KCkgOiB2b2lkIHtcclxuXHRcdGxldCBpbnB1dCA9IHRoaXMuX2dhbWUuaW5wdXQ7XHJcblxyXG5cdFx0bGV0IG1vdmluZ1ggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF07XHJcblx0XHRsZXQgbW92aW5nWSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5Eb3duXTtcclxuXHJcblx0XHRsZXQgc3BlZWQgPSBtb3ZpbmdYICYmIG1vdmluZ1kgPyBNYXRoLnNxcnQodGhpcy5zcGVlZCAqIHRoaXMuc3BlZWQgLyAyKSA6IHRoaXMuc3BlZWQ7XHJcblxyXG5cdFx0bGV0IGRpcmVjdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xyXG5cclxuXHRcdGRpcmVjdGlvbi54ID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0gID8gLTEgOiAxLFxyXG5cdFx0ZGlyZWN0aW9uLnkgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gPyAtMSA6IDFcclxuXHJcblx0XHRkaXJlY3Rpb24ueCA9IG1vdmluZ1ggPyBkaXJlY3Rpb24ueCA6IDA7XHJcblx0XHRkaXJlY3Rpb24ueSA9IG1vdmluZ1kgPyBkaXJlY3Rpb24ueSA6IDA7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIHNwZWVkO1xyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIHNwZWVkO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKFwiUGxheWVyIHNwZWVkOiBcIiArIHRoaXMuYm9keS5zcGVlZCk7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cclxuXHRcdGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdKSB7XHJcblx0ICAgICAgICB0aGlzLnNob290KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZUFuaW1hdGlvbigpIHtcclxuXHRcdGxldCBhbmltYXRpb24gPSB0aGlzLl9nYW1lLm1vdXNlLnggPiB0aGlzLmJvZHkucG9zaXRpb24ueCA/ICdyaWdodCcgOiAnbGVmdCc7XHJcblxyXG5cdFx0dGhpcy5hbmltYXRlKGFuaW1hdGlvbik7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuYWxpdmUpIHtcclxuXHRcdFx0dGhpcy51cGF0ZU1vdmVtZW50KCk7XHJcblx0XHRcdHRoaXMudXBkYXRlQW5pbWF0aW9uKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsImV4cG9ydCBpbnRlcmZhY2UgUG9pbnQge1xyXG5cdHggOiBudW1iZXI7XHJcblx0eSA6IG51bWJlcjtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7IFxyXG5cdHg6IG51bWJlcjtcclxuXHR5OiBudW1iZXI7XHJcblx0d2lkdGg6IG51bWJlcjtcclxuXHRoZWlnaHQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZlY3RvciB7XHJcblx0eCA6IG51bWJlciA9IDA7XHJcblx0eSA6IG51bWJlciA9IDA7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHtcclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCh2YWx1ZTogbnVtYmVyIHwgVmVjdG9yKTogdm9pZCB7XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdHRoaXMueCA9IHRoaXMueSA9IHZhbHVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy54ID0gdmFsdWUueDtcclxuXHRcdFx0dGhpcy55ID0gdmFsdWUueTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBjbG9uZSgpOiBWZWN0b3Ige1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG1hZ25pdHVkZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGFkZCh2ZWMxOiBWZWN0b3IsIHZlYzI6IFZlY3Rvcik6IFZlY3RvciB7XHJcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih2ZWMxLnggKyB2ZWMyLngsIHZlYzEueSArIHZlYzIueSk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgc3VidHJhY3QodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjMS54IC0gdmVjMi54LCB2ZWMxLnkgLSB2ZWMyLnkpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIG11bHRpcGx5KHZlYzogVmVjdG9yLCBzY2FsYXI6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjLnggKiBzY2FsYXIsIHZlYy55ICogc2NhbGFyKTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBmcm9tKHBvaW50OiBQb2ludCkge1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IocG9pbnQueCwgcG9pbnQueSk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgR2FtZSwgQ29uZmlnIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdHByaXZhdGUgX3RpbGUgPSB7XHJcblx0XHR3aWR0aCA6IDMwLFxyXG5cdFx0aGVpZ2h0OiAzMFxyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqXHRTcHJpdGVzIEkgdXNlIGZvciBhIGRldmVsb3BtZW50IHdlcmUgY3JlYXRlZCBieSBDb2R5IFNoZXBwIGZvciBoaXMgZ2FtZSBEZW50YWwgRGVmZW5kZXI6IFNhZ2Egb2YgdGhlIENhbmR5IEhvcmRlLlxyXG5cdCAqXHRQbGVhc2UgY2hlY2sgaGlzIGdpdGh1YiByZXBvOiBodHRwczovL2dpdGh1Yi5jb20vY3NoZXBwL2NhbmR5amFtL1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3Jlc291cmNlcyA9IHtcclxuXHRcdCdwbGF5ZXInIDogJy4vaW1nL3BsYXllci5wbmcnLFxyXG5cdFx0J2VuZW15JyA6ICcuL2ltZy9lbmVteS5wbmcnLFxyXG5cdFx0J2J1bGxldCcgOiAnLi9pbWcvYnVsbGV0LnBuZycsXHJcblx0XHQnd2FsbCc6ICcuL2ltZy90cmVlLXJlZC0xLnBuZydcclxuXHJcblx0fVxyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlclRpbGUocG9zOiBQb2ludCwgY29sb3I6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LnJlY3QocG9zLngsIHBvcy55LCB0aGlzLl90aWxlLndpZHRoLCB0aGlzLl90aWxlLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5maWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW5kZXJUaWxlcygpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNvbG9ycyA9IFtcIiM3ODVjOThcIiwgXCIjNjk0Zjg4XCJdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMuX2dhbWUubWFwLndpZHRoOyB4ICs9IHRoaXMuX3RpbGUud2lkdGgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQ7IHkgKz0gdGhpcy5fdGlsZS5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcclxuICAgICAgICAgICAgICAgIGxldCB5SW5kZXggPSAoeSAvIHRoaXMuX3RpbGUuaGVpZ2h0KSAlIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGVQb3MgPSB0aGlzLmNhbWVyYU9mZnNldCh7eCwgeX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlUG9zLCBjb2xvcnNbeEluZGV4IF4geUluZGV4XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW1lcmFPZmZzZXQocG9zOiBQb2ludCkgOiBQb2ludCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckhlbHBlcihzb3VyY2UgOiBzdHJpbmcsIGNvbGxlY3Rpb24gOiBFbnRpdHlbXSkge1xyXG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0aW1nLnNyYyA9IHNvdXJjZTtcclxuXHJcblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHtcclxuXHRcdFx0bGV0IGZyYW1lID0gZS5jdXJyZW50QW5pbWF0aW9uLmN1cnJlbnRGcmFtZTtcclxuXHRcdFx0bGV0IHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KGUuYm9keS5wb3NpdGlvbik7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fZ2FtZS5jb25maWcuc2hvd0FBQkIpIHtcclxuXHRcdFx0XHR0aGlzLnJlbmRlckFBQkIobmV3IEJvZHkobmV3IFZlY3Rvcihwb3MueCwgcG9zLnkpLCBlLmJvZHkud2lkdGgsIGUuYm9keS5oZWlnaHQpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmRyYXdJbWFnZShcclxuXHRcdFx0XHRpbWcsXHJcblx0XHRcdFx0ZnJhbWUueCwgZnJhbWUueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0LFxyXG5cdFx0XHRcdHBvcy54LCBwb3MueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckhwQmFyKGU6IEVudGl0eSkge1xyXG5cdFx0bGV0IGJhclNpemUgPSB7IHdpZHRoOiA1MCwgaGVpZ2h0OiA1IH07XHJcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xyXG5cdFx0bGV0IHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KFZlY3Rvci5zdWJ0cmFjdChlLmJvZHkucG9zaXRpb24sIG5ldyBWZWN0b3IoNSwgMTUpKSk7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnJlY3QoXHJcblx0XHRcdHBvcy54LFxyXG5cdFx0XHRwb3MueSxcclxuXHRcdFx0YmFyU2l6ZS53aWR0aCxcclxuXHRcdFx0YmFyU2l6ZS5oZWlnaHRcclxuXHRcdCk7XHJcblxyXG5cdFx0dmFyIGdyZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudChwb3MueCwgcG9zLnksIHBvcy54ICsgYmFyU2l6ZS53aWR0aCwgcG9zLnkgKyBiYXJTaXplLmhlaWdodCk7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDAsIFwicmVkXCIpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcChlLmhlYWx0aCAvIDEwMCwgXCJyZWRcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKGUuaGVhbHRoIC8gMTAwLCBcImJsYWNrXCIpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgxLCBcImJsYWNrXCIpO1xyXG5cclxuXHRcdGN0eC5maWxsU3R5bGUgPSBncmQ7XHJcblx0XHRjdHguZmlsbCgpO1xyXG5cdH1cclxuXHJcblx0Ly8gdG9kbzogZXh0cmFjdCBocC1iYXIgcmVuZGVyaW5nIGxvZ2ljXHJcblx0cHJpdmF0ZSByZW5kZXJIdWQoKTogdm9pZCB7XHJcblx0XHRsZXQgb2Zmc2V0ID0gMjA7XHJcblxyXG5cdFx0bGV0IGJhclNpemUgPSB7IHdpZHRoOiAxNTAsIGhlaWdodDogMTAgfTtcclxuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnJlY3QoXHJcblx0XHRcdG9mZnNldCxcclxuXHRcdFx0dGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0ICogMS4yLFxyXG5cdFx0XHRiYXJTaXplLndpZHRoLFxyXG5cdFx0XHRiYXJTaXplLmhlaWdodFxyXG5cdFx0KTtcclxuXHJcblxyXG5cdFx0dmFyIGdyZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudChvZmZzZXQsIHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCAtIG9mZnNldCwgb2Zmc2V0ICsgYmFyU2l6ZS53aWR0aCwgdGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0ICsgYmFyU2l6ZS5oZWlnaHQpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgwLCBcIiM0Y2FmNTBcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKHRoaXMuX2dhbWUucGxheWVyLmhlYWx0aCAvIDEwMCwgXCIjNGNhZjUwXCIpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCh0aGlzLl9nYW1lLnBsYXllci5oZWFsdGggLyAxMDAsIFwiYmxhY2tcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDEsIFwiYmxhY2tcIik7XHJcblxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGdyZDtcclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiIzE4MjUyNFwiO1xyXG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcblx0XHRjdHguZmlsbCgpO1xyXG5cdFx0Y3R4LnN0cm9rZSgpO1xyXG5cclxuXHRcdGN0eC5mb250ID0gJzIwcHggQ29uc29sYXMnO1xyXG4gIFx0XHRjdHguZmlsbFN0eWxlID0gXCIjZjZlODU1XCI7XHJcblx0XHRjdHguZmlsbFRleHQodGhpcy5fZ2FtZS5zY29yZS50b1N0cmluZygpLCBvZmZzZXQsIHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCAtIG9mZnNldCAqIDEuNSk7XHJcblx0XHRcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVyQUFCQihib2R5OiBCb2R5KSB7XHJcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xyXG5cclxuXHRcdGN0eC5iZWdpblBhdGgoKTtcclxuXHRcdGN0eC50cmFuc2xhdGUoMC41LCAwLjUpO1xyXG5cdFx0Y3R4LnJlY3QoXHJcblx0XHRcdGJvZHkucG9zaXRpb24ueCxcclxuXHRcdFx0Ym9keS5wb3NpdGlvbi55LFxyXG5cdFx0XHRib2R5LndpZHRoLFxyXG5cdFx0XHRib2R5LmhlaWdodFxyXG5cdFx0KTtcclxuXHJcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xyXG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcblx0XHRjdHguc3Ryb2tlKCk7XHJcblx0XHRjdHgudHJhbnNsYXRlKC0wLjUsIC0wLjUpO1xyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuY2xlYXIoKTtcclxuXHJcblx0XHR0aGlzLnJlbmRlclRpbGVzKCk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2J1bGxldCddLCB0aGlzLl9nYW1lLmJ1bGxldHMpO1xyXG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydlbmVteSddLCB0aGlzLl9nYW1lLmVuZW1pZXMpO1xyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goZSA9PiB7XHJcblx0XHRcdHRoaXMucmVuZGVySHBCYXIoZSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ3BsYXllciddLCBbdGhpcy5fZ2FtZS5wbGF5ZXJdKTtcclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snd2FsbCddLCB0aGlzLl9nYW1lLndhbGxzKTtcclxuXHRcdHRoaXMucmVuZGVySHVkKCk7XHJcblx0fVxyXG5cclxuXHRjbGVhcigpIDogdm9pZCB7XHJcblx0XHRsZXQgdyA9IHRoaXMuX2dhbWUuY2FudmFzLndpZHRoO1xyXG5cdFx0bGV0IGggPSB0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQ7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBVcGRhdGVyIHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYWxsRW50aXRpZXMoKSA6IEVudGl0eVtdIHtcclxuXHRcdHJldHVybiA8RW50aXR5W10+IEFycmF5LnByb3RvdHlwZS5jb25jYXQoXHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cyxcclxuXHRcdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLFxyXG5cdFx0XHR0aGlzLl9nYW1lLnBsYXllclxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9ucygpIDogdm9pZCB7XHJcblx0XHRsZXQgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaCgoZSk9PiB7IGUuY3VycmVudEFuaW1hdGlvbi51cGRhdGUodGhpcy5fZ2FtZS5nYW1lVGltZSk7IH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVFbnRpdGllcygpIDogdm9pZCB7XHJcblx0XHRsZXQgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaChlID0+IHsgZS51cGRhdGUoKTsgfSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZURlYWQoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmJ1bGxldHMpOyB9KVxyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmVuZW1pZXMpOyB9KVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW1vdmVEZWFkKGU6IEVudGl0eSwgY29sbGVjdGlvbjogRW50aXR5W10pIHtcclxuXHRcdGlmIChlLmFsaXZlID09PSBmYWxzZSkge1xyXG5cdFx0XHRsZXQgZUluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGUpO1xyXG5cclxuXHRcdFx0aWYgKGVJbmRleCA+IC0xKSB7XHJcblx0XHRcdFx0Y29sbGVjdGlvbi5zcGxpY2UoZUluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMudXBkYXRlQW5pbWF0aW9ucygpO1xyXG5cdFx0dGhpcy51cGRhdGVFbnRpdGllcygpO1xyXG5cdFx0dGhpcy51cGRhdGVEZWFkKCk7XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnRhcmdldCA9IHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb247XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jb2xsaXNpb25zLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5pbnB1dC51cGRhdGUoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9vcCgpIHt9O1xyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG5cdHN0YXRpYyBjbGFtcCh2YWx1ZSA6IG51bWJlciwgbWluIDogbnVtYmVyLCBtYXggOiBudW1iZXIpIDogbnVtYmVyIHtcclxuXHRcdGlmICh2YWx1ZSA+IG1heCkgeyByZXR1cm4gbWF4OyB9XHJcblx0XHRpZiAodmFsdWUgPCBtaW4pIHsgcmV0dXJuIG1pbjsgfVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcclxuXHJcbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XHJcblx0cHVibGljIHRhcmdldDogUG9pbnQ7XHJcblx0cHVibGljIHBvc2l0aW9uOiBQb2ludCA9IHsgeCA6IDAsIHkgOiAwIH07XHJcblxyXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XHJcblx0cHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcclxuXHRwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xyXG5cdFx0dGhpcy5faGVpZ2h0ID0gZ2FtZUluc3RhbmNlLmNhbnZhcy5oZWlnaHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhbGN1bGF0ZVBvc2l0aW9uKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMucG9zaXRpb24ueCA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueCAtIHRoaXMuX3dpZHRoIC8gMiwgMCwgdGhpcy5fZ2FtZS5tYXAud2lkdGggLSB0aGlzLl93aWR0aCk7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnkgPSBVdGlsLmNsYW1wKHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdhbGwgZXh0ZW5kcyBFbnRpdHkge1xyXG4gICAgcHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigpLCAxNTEsIDIxMSk7XHJcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDE1MSwgMjExKSk7XHJcblxyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFBvaW50KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmJvZHkucG9zaXRpb24gPSBWZWN0b3IuZnJvbShwb3NpdGlvbik7XHJcbiAgICB9XHJcbn0iXX0=
