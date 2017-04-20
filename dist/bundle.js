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
        this.collideWorldBounds = true;
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
                });
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
    constructor(target) {
        super();
        this._animations = {
            'idle': new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'right': new animation_1.Animation(4, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'left': new animation_1.Animation(4, 1, frame_1.Frame.create(0, 0, 36, 36))
        };
        this.speed = 3;
        this.body = new body_1.Body(new primitives_1.Vector(100, 100), 36, 36);
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
        this.enemies.push(new enemy_1.Enemy(this.player));
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
        this.upateMovement();
        this.updateAnimation();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JlbmRlcmVyLnRzIiwic3JjL2pzL3VwZGF0ZXIudHMiLCJzcmMvanMvdXRpbC50cyIsInNyYy9qcy92aWV3cG9ydC50cyIsInNyYy9qcy93YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0NBLE1BQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBRWpDO0lBbUJDLFlBQVksTUFBYyxFQUFFLEdBQVcsRUFBRSxLQUFZO1FBWjlDLFVBQUssR0FBWSxDQUFDLENBQUM7UUFNbkIsU0FBSSxHQUFZLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDNUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFXO1FBQ3JCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFP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M0MscUJBQWdCLEdBQWMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBS3BGLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU8sV0FBVyxDQUFDLFFBQWU7UUFDNUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FB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bUJBQTBCLGVBQU07SUFJNUIsWUFBWSxRQUFlO1FBQ3ZCLE9BQU8sQ0FBQztRQUpMLFNBQUksR0FBVSxJQUFJLFdBQUksQ0FBQyxJQUFJLG1CQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEQscUJBQWdCLEdBQWMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBSWhGLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLG1CQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDTCxDQUFDO0FBUlksWUFBSSxPQVFoQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XG5pbXBvcnQgKiBhcyBDb25zdCBmcm9tICcuL2NvbnN0JztcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XG5cdHB1YmxpYyBjdXJyZW50RnJhbWUgOiBGcmFtZTtcblxuXHQvKipcblx0ICogTnVtYmVyIG9mIGZyYW1lcyBwZXIgc2Vjb25kXG5cdCAqIEB0eXBlIHtudW1iZXJ9XG5cdCAqL1xuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAwO1xuXHQvKipcblx0ICogVE9ETzogSW1wbGVtZW50LCBmaWVsZCBpcyBub3QgdXNlZCBcblx0ICogU2V0IHRvIHRydWUgdG8gbWFrZSBhbmltYXRpb24gbG9vcGVkLCBmYWxzZSAtIGZvciBvbmUgY3ljbGUgb25seVxuXHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0ICovXG5cdHB1YmxpYyBsb29wOiBib29sZWFuID0gdHJ1ZTtcblxuXHRwcml2YXRlIF9sYXN0QW5pbWF0ZWQgOiBEYXRlID0gbmV3IERhdGUoMCk7XG5cdHByaXZhdGUgX3JvdyA6IG51bWJlcjtcblx0cHJpdmF0ZSBfbGVuZ3RoIDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGxlbmd0aDogbnVtYmVyLCByb3c6IG51bWJlciwgZnJhbWU6IEZyYW1lKSB7XG5cdFx0dGhpcy5fcm93ID0gcm93O1xuXHRcdHRoaXMuX2xlbmd0aCA9IGxlbmd0aDtcblxuXHRcdHRoaXMuY3VycmVudEZyYW1lID0gZnJhbWU7XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueSA9IHRoaXMuX3JvdyAqIHRoaXMuY3VycmVudEZyYW1lLmhlaWdodDtcblx0fVxuXG5cdGNhbkFuaW1hdGUodGltZSA6IERhdGUpIDogYm9vbGVhbiB7XG5cdFx0bGV0IGFuaW1hdGlvbkRlbHRhID0gdGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0QW5pbWF0ZWQuZ2V0VGltZSgpO1xuXG5cdFx0cmV0dXJuIGFuaW1hdGlvbkRlbHRhID4gdGhpcy5kZWxheTtcblx0fVxuXG5cdGdldCBkZWxheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiBDb25zdC5NU19JTl9TRUMgLyB0aGlzLnNwZWVkO1xuXHR9XG5cblx0bmV4dCgpOiB2b2lkIHtcblx0XHRsZXQgaW5kZXggPSB0aGlzLmN1cnJlbnRGcmFtZS5pbmRleDtcblxuXHRcdGluZGV4ID0gKGluZGV4ICsgMSkgJSB0aGlzLl9sZW5ndGg7XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUuaW5kZXggPSBpbmRleDtcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS54ID0gaW5kZXggKiB0aGlzLmN1cnJlbnRGcmFtZS53aWR0aDtcblx0fVxuXG5cdHVwZGF0ZShnYW1lVGltZTogRGF0ZSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmNhbkFuaW1hdGUoZ2FtZVRpbWUpKSB7XG5cdFx0XHR0aGlzLl9sYXN0QW5pbWF0ZWQgPSBnYW1lVGltZTtcblxuXHRcdFx0dGhpcy5uZXh0KCk7XG5cdFx0fVxuXHR9XG5cblx0cmVzZXQoKTogdm9pZCB7XG5cdFx0dGhpcy5fbGFzdEFuaW1hdGVkID0gbmV3IERhdGUoMCk7XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUuaW5kZXggPSAwO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLnggPSAwO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4vd29ybGQnO1xuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBub29wIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBPbkNvbGxpZGUge1xuXHQob2JqOiBFbnRpdHkgfCBXb3JsZCkgOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQm9keSB7XG5cdHBvc2l0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XG5cdHZlbG9jaXR5OiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XG5cdG92ZXJsYXA6IFZlY3RvciA9ICBuZXcgVmVjdG9yKCk7IFxuXHRzcGVlZCA6IG51bWJlcjtcblx0d2lkdGggOiBudW1iZXI7XG5cdGhlaWdodCA6IG51bWJlcjtcblxuXHRvbkNvbGxpZGU6IE9uQ29sbGlkZTtcblx0Y29sbGlkZVdvcmxkQm91bmRzOiBib29sZWFuID0gdHJ1ZTtcblxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjogVmVjdG9yLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuXHRcdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cblxuXHQvLyBUT0RPOiBOZWVkcyB0byBiZSBpbXByb3ZlZCBiZWFjYXVzZSBtb3JlIEZQUyByZXN1bHRzIGluIGZhc3RlciBtb3ZlbWVudDtcblx0cHJpdmF0ZSB1cGRhdGVNb3ZlbWVudCgpOnZvaWQge1xuXHRcdHRoaXMucG9zaXRpb24gPSBWZWN0b3IuYWRkKHRoaXMucG9zaXRpb24sIHRoaXMudmVsb2NpdHkpO1xuXG5cdFx0dGhpcy5zcGVlZCA9IE1hdGguaHlwb3QodGhpcy52ZWxvY2l0eS54LCB0aGlzLnZlbG9jaXR5LnkpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMudXBkYXRlTW92ZW1lbnQoKTtcblx0fVxufSIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xuXG5leHBvcnQgY2xhc3MgQnVsbGV0IGV4dGVuZHMgRW50aXR5IHtcblx0cHVibGljIHRhcmdldCA6IFBvaW50O1xuXHRwdWJsaWMgcGFyZW50IDogRW50aXR5O1xuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAxMDtcblx0cHVibGljIGRhbWFnZUFtb3VudCA6IG51bWJlciA9IDEwO1xuXHRwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKCksIDMsIDMpO1xuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTAsIDEwKSk7XG5cblx0Y29uc3RydWN0b3IocG9zaXRpb246IFBvaW50LCB0YXJnZXQ6IFBvaW50LCBwYXJlbnQgOiBFbnRpdHkpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5ib2R5LnBvc2l0aW9uID0gbmV3IFZlY3Rvcihwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuXHRcdHRoaXMuc2V0VmVsb2NpdHkodGhpcy50YXJnZXQpO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXRWZWxvY2l0eShwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XG4gICAgICAgIGxldCBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XG4gICAgICAgIGxldCBkeSA9IE1hdGguYWJzKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XG5cbiAgICAgICAgbGV0IGRpclggPSBwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnggPiAwID8gMSA6IC0xO1xuICAgICAgICBsZXQgZGlyWSA9IHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSA+IDAgPyAxIDogLTE7XG5cbiAgICAgICAgbGV0IHggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XG4gICAgICAgIGxldCB5ID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xuXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eSA9IG5ldyBWZWN0b3IoeCwgeSk7XG5cdH1cblxuXHR1cGRhdGUoKSA6IHZvaWQge1xuXHRcdHRoaXMuYm9keS51cGRhdGUoKTtcblx0fVxufVxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBQaHlzaWNzIH0gZnJvbSAnLi9waHlzaWNzJztcblxuZXhwb3J0IGNsYXNzIENvbGxpc2lvbk1hbmFnZXIgeyBcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdH1cblxuXHR1cGRhdGUoKSA6IHZvaWQge1xuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goKGJ1bGxldCkgPT4ge1xuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUoZW5lbXkuYm9keSwgYnVsbGV0LmJvZHksICgpID0+IHtcblx0XHRcdFx0XHRlbmVteS5kYW1hZ2UoYnVsbGV0LmRhbWFnZUFtb3VudCwgYnVsbGV0LnBhcmVudCk7XG5cblx0XHRcdFx0XHRidWxsZXQua2lsbCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5fZ2FtZS53YWxscy5mb3JFYWNoKHcgPT4ge1xuXHRcdFx0UGh5c2ljcy5jb2xsaWRlKHRoaXMuX2dhbWUucGxheWVyLmJvZHksIHcuYm9keSwgKCkgPT4ge1xuXHRcdFx0XHQvL3RoaXMuX2dhbWUucGxheWVyLmJvZHkuaXNCbG9ja2VkID0gdHJ1ZTtcblx0XHRcdFx0bGV0IG92ZXJsYXAgPSBQaHlzaWNzLmdldE92ZXJsYXAodGhpcy5fZ2FtZS5wbGF5ZXIuYm9keSwgdy5ib2R5KTtcblxuXHRcdFx0XHRpZiAoTWF0aC5hYnMob3ZlcmxhcC54KSA8IE1hdGguYWJzKG92ZXJsYXAueSkpIHtcblx0XHRcdFx0XHR0aGlzLl9nYW1lLnBsYXllci5ib2R5LnBvc2l0aW9uLnggKz0gb3ZlcmxhcC54O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb24ueSArPSBvdmVybGFwLnk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5fZ2FtZS53YWxscy5mb3JFYWNoKHcgPT4ge1xuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goYiA9PiB7XG5cdFx0XHRcdFBoeXNpY3MuY29sbGlkZSh3LmJvZHksIGIuYm9keSwgKCkgPT4ge1xuXHRcdFx0XHRcdGIua2lsbCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pXG5cdH1cbn0iLCJleHBvcnQgY29uc3QgTVNfSU5fU0VDID0gMTAwMDtcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBFbnRpdHkge1xuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XG5cdFx0XHQnaWRsZScgOiBuZXcgQW5pbWF0aW9uKDEsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcblx0XHRcdCdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcblx0XHRcdCdsZWZ0JyA6IG5ldyBBbmltYXRpb24oNCwgMSwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpXG4gICAgfTtcblxuICAgIHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xuICAgIHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDM7XG4gICAgcHVibGljIHRhcmdldCA6IEVudGl0eTtcbiAgICBwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKDEwMCwgMTAwKSwgMzYsIDM2KTtcblxuXHRjb25zdHJ1Y3Rvcih0YXJnZXQ6IEVudGl0eSkge1xuXHRcdHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XG5cdH1cblxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZykgOiB2b2lkIHtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25zW2FuaW1hdGlvbl07XG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTA7XG5cdH1cblxuICAgIC8vIFRPRE8gOiBpbnZlc3RpZ2F0ZSBpc3N1ZSB3aXRoIGRpYWdvbmFsIHNwZWVkLiB+Mi4xMiB3aGVuIGlzIHN1cHBvc2VkIHRvIGJlIDNcblx0bW92ZVRvd2FyZHMocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xuICAgICAgICBsZXQgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIGxldCBkaXJYID0gTWF0aC5zaWduKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XG4gICAgICAgIGxldCBkaXJZID0gTWF0aC5zaWduKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XG5cbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xuXG4gICAgICAgIGlmIChkaXJYID4gMCkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdsZWZ0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKCk7XG5cdH1cblxuXHR1cGRhdGUoKSA6IHZvaWQge1xuXHRcdHRoaXMubW92ZVRvd2FyZHModGhpcy50YXJnZXQuYm9keS5wb3NpdGlvbik7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkVuZW15IHNwZWVkOiBcIiArIHRoaXMuYm9keS5zcGVlZCk7XG5cdH1cbn1cbiIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5IHtcblx0cHJpdmF0ZSBfaGVhbHRoIDogbnVtYmVyID0gMTAwO1xuXHRwcml2YXRlIF9hbGl2ZSA6IGJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9hdHRhY2tlciA6IEVudGl0eTtcblxuXHRwdWJsaWMgYm9keSA6IEJvZHk7XG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xuXG5cdGdldCBoZWFsdGgoKSA6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2hlYWx0aDtcblx0fVxuXG5cdGdldCBhbGl2ZSgpIDogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2FsaXZlO1xuXHR9XG5cblx0cHJpdmF0ZSBfc2V0SGVhbHRoKG51bWJlcjogbnVtYmVyKSB7XG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA+IDAgJiYgdGhpcy5fYWxpdmUpIHtcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XG5cdFx0XHR0aGlzLmtpbGwoKTtcblx0XHR9XG5cdH1cblxuXHRraWxsKCkge1xuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XG5cdFx0dGhpcy5fYWxpdmUgPSBmYWxzZTtcblx0fVxuXG5cdGRhbWFnZShhbW91bnQgOiBudW1iZXIsIGF0dGFja2VyOiBFbnRpdHkpIDogdm9pZCB7XG5cdFx0dGhpcy5fc2V0SGVhbHRoKC1hbW91bnQpO1xuXG5cdFx0dGhpcy5fYXR0YWNrZXIgPSBhdHRhY2tlcjtcblx0fVxuXG5cdGhlYWwoYW1vdW50IDogbnVtYmVyKSB7XG5cdFx0dGhpcy5fc2V0SGVhbHRoKGFtb3VudCk7XG5cdH1cblxuXHR1cGRhdGUoKSB7fVxufSIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcblxuZXhwb3J0IGNsYXNzIEZyYW1lIHtcblx0aW5kZXggOiBudW1iZXIgPSAwO1xuXHR4OiBudW1iZXIgPSAwO1xuXHR5OiBudW1iZXIgPSAwO1xuXHR3aWR0aDogbnVtYmVyID0gMDtcblx0aGVpZ2h0OiBudW1iZXIgPSAwO1xuXHRuYW1lIDogc3RyaW5nO1xuXG5cdHN0YXRpYyBjcmVhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWUge1xuXHRcdGxldCBmcmFtZSA9IG5ldyBGcmFtZSgpO1xuXG5cdFx0ZnJhbWUueCA9IHg7XG5cdFx0ZnJhbWUueSA9IHk7XG5cdFx0ZnJhbWUud2lkdGggPSB3aWR0aDtcblx0XHRmcmFtZS5oZWlnaHQgPSBoZWlnaHQ7XG5cdFx0ZnJhbWUubmFtZSA9IG5hbWU7XG5cblx0XHRyZXR1cm4gZnJhbWU7XG5cdH1cbn1cbiIsImltcG9ydCB7IEJ1bGxldCB9IGZyb20gJy4vYnVsbGV0JztcbmltcG9ydCB7IENvbGxpc2lvbk1hbmFnZXIgfSBmcm9tICcuL2NvbGxpc2lvbi1tYW5hZ2VyJztcbmltcG9ydCB7IEVuZW15IH0gZnJvbSAnLi9lbmVteSc7XG5pbXBvcnQgeyBXYWxsIH0gZnJvbSAnLi93YWxsJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi9pbnB1dCc7XG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyZXInO1xuaW1wb3J0IHsgVXBkYXRlciB9IGZyb20gJy4vdXBkYXRlcic7IFxuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuXHRjb250YWluZXIgOiBzdHJpbmc7XG5cdHNob3dBQUJCIDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuXHRwdWJsaWMgY29uZmlnIDogQ29uZmlnO1xuXHRwdWJsaWMgY2FudmFzIDogSFRNTENhbnZhc0VsZW1lbnQ7XG5cdHB1YmxpYyBjb250ZXh0IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXHRwdWJsaWMgaXNSdW5uaW5nID0gZmFsc2U7XG5cdHB1YmxpYyBwbGF5ZXI6IFBsYXllcjtcblx0cHVibGljIGJ1bGxldHM6IEJ1bGxldFtdID0gW107XG5cdHB1YmxpYyBlbmVtaWVzOiBFbmVteVtdID0gW107XG5cdHB1YmxpYyB3YWxsczogV2FsbFtdID0gW107XG5cblx0cHVibGljIGdhbWVUaW1lOiBEYXRlO1xuXG5cdHB1YmxpYyBtYXA6IE1hcDtcblx0cHVibGljIGlucHV0OiBJbnB1dDtcblx0cHVibGljIHZpZXdwb3J0OiBWaWV3cG9ydDtcblx0cHVibGljIHJlbmRlcmVyOiBSZW5kZXJlcjtcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XG5cdHB1YmxpYyBjb2xsaXNpb25zOiBDb2xsaXNpb25NYW5hZ2VyO1xuXHRwdWJsaWMgbW91c2U6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XG5cdC8qKlxuXHQgKiBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdW5pcXVlIElEOyB1c2VkIHRvIGNhbmNlbCBSQUYtbG9vcFxuXHQgKiBAdHlwZSB7bnVtYmVyfVxuXHQgKi9cblx0cHJpdmF0ZSBfcmFmSWQgOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0XHR0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb25maWcuY29udGFpbmVyKTtcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHRoaXMpO1xuXHRcdHRoaXMubWFwID0gbmV3IE1hcCgpO1xuXHRcdHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQodGhpcyk7XG5cdFx0dGhpcy52aWV3cG9ydCA9IG5ldyBWaWV3cG9ydCh0aGlzKTtcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHRoaXMpO1xuXHRcdHRoaXMudXBkYXRlciA9IG5ldyBVcGRhdGVyKHRoaXMpO1xuXHRcdHRoaXMuY29sbGlzaW9ucyA9IG5ldyBDb2xsaXNpb25NYW5hZ2VyKHRoaXMpO1xuXHRcdHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLnBsYXllcikpO1xuXHRcdHRoaXMud2FsbHMucHVzaChuZXcgV2FsbCh7IHg6IDM1MCwgeTogMjAgfSkpO1xuXHR9XG5cblx0dGljaygpIDogdm9pZCB7XG5cdFx0dGhpcy5nYW1lVGltZSA9IG5ldyBEYXRlKCk7XG5cblx0XHRpZiAodGhpcy5pc1J1bm5pbmcpIHtcblx0XHRcdHRoaXMucmVuZGVyZXIucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xuXHR9XG5cblx0cnVuKCkgOiB2b2lkIHtcblx0XHRpZiAodGhpcy5pc1J1bm5pbmcgPT09IGZhbHNlKSB7XG5cdFx0XHR0aGlzLnRpY2soKTtcblxuXHRcdFx0dGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdHN0b3AoKSA6IHZvaWQge1xuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xuXHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmSWQpO1xuXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxufVxuXG5sZXQgZ2FtZSA9IG5ldyBHYW1lKHtcblx0Y29udGFpbmVyOiAnLmdhbWUnLFxuXHRzaG93QUFCQjogZmFsc2Vcbn0pO1xuXG5nYW1lLnJ1bigpOyIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcblxuZXhwb3J0IGVudW0gQWN0aW9uIHsgXG5cdFVwLCBcblx0RG93bixcblx0TGVmdCxcblx0UmlnaHQsXG5cdEF0dGFja1xufVxuXG5lbnVtIEtleSB7XG5cdFcgPSA4Nyxcblx0QSA9IDY1LFxuXHRTID0gODMsXG5cdEQgPSA2OCxcblx0VXAgPSAzOCxcblx0RG93biA9IDQwLFxuXHRMZWZ0ID0gMzcsXG5cdFJpZ2h0ID0gMzlcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0IHtcblx0cHJpdmF0ZSBfYmluZGluZ3MgOiBNYXA8QWN0aW9uPiA9IHtcblx0XHRbS2V5LlddIDogQWN0aW9uLlVwLFxuXHRcdFtLZXkuQV0gOiBBY3Rpb24uTGVmdCxcblx0XHRbS2V5LlNdIDogQWN0aW9uLkRvd24sXG5cdFx0W0tleS5EXSA6IEFjdGlvbi5SaWdodCxcblx0XHRbS2V5LlVwXSA6IEFjdGlvbi5VcCxcblx0XHRbS2V5LkRvd25dIDogQWN0aW9uLkRvd24sXG5cdFx0W0tleS5MZWZ0XSA6IEFjdGlvbi5MZWZ0LFxuXHRcdFtLZXkuUmlnaHRdIDogQWN0aW9uLlJpZ2h0XG5cdH07XG5cblx0cHVibGljIGFjdGlvbnMgOiBNYXA8Ym9vbGVhbj4gPSB7fTtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cdHByaXZhdGUgX21vdXNlUG9zOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcykpO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duLmJpbmQodGhpcykpO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwLmJpbmQodGhpcykpO1xuXHR9XG5cblx0YmluZChrZXk6IEtleSwgYWN0aW9uOiBBY3Rpb24pIHtcblx0XHR0aGlzLnVuYmluZChrZXkpO1xuXG5cdFx0dGhpcy5fYmluZGluZ3Nba2V5XSA9IGFjdGlvbjtcblx0fVxuXG5cdHVuYmluZChrZXk6IEtleSkge1xuXHRcdGlmICh0aGlzLl9iaW5kaW5nc1trZXldKSB7XG5cdFx0XHRkZWxldGUgdGhpcy5fYmluZGluZ3Nba2V5XTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7IFxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcblxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSB0cnVlO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBvbktleVVwKGU6IEtleWJvYXJkRXZlbnQpIHtcblx0XHRsZXQgYWN0aW9uID0gdGhpcy5fYmluZGluZ3NbZS53aGljaF07XG5cblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuYWN0aW9uc1thY3Rpb25dID0gZmFsc2U7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VEb3duKGU6IE1vdXNlRXZlbnQpIHtcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcblxuXHRcdHRoaXMuZ2V0TW91c2VQb3NpdGlvbihlKTtcblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gdHJ1ZTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpIHtcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcblxuXHRcdGlmIChlLmJ1dHRvbiA9PSBsZWZ0QnV0dG9uKSB7XG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSBmYWxzZTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE8gOiBOZWVkcyBiZXR0ZXIgaW1wbGVtZW50YXRpb25cblx0cHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGU6IE1vdXNlRXZlbnQpIHsgXG5cdFx0bGV0IGNhbnZhc09mZnNldCA9IHRoaXMuX2dhbWUuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XG5cdCAgICAgIHg6IGUuY2xpZW50WCAtIGNhbnZhc09mZnNldC5sZWZ0LFxuXHQgICAgICB5OiBlLmNsaWVudFkgLSBjYW52YXNPZmZzZXQudG9wXG5cdCAgICB9O1xuXG5cdCAgIFx0dGhpcy5fZ2FtZS5tb3VzZSA9IHtcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIHVwZGF0ZSgpIHtcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xuXHRcdFx0eDogdGhpcy5fbW91c2VQb3MueCArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcblx0XHR9XG5cdH1cbn0iLCJleHBvcnQgY2xhc3MgTWFwIHsgXG5cdHB1YmxpYyB3aWR0aCA6IG51bWJlciA9IDIwMDA7XG5cdHB1YmxpYyBoZWlnaHQgOiBudW1iZXIgPSAxNTAwO1xufSIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcblxuXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XG5cdCAvKipcbiAgICAgKiBDaGVja3MgaWYgdHdvIHJlY3Rhbmd1bGFyIGJvZGllcyBpbnRlcnNlY3RcbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MSBGaXJzdCBib2R5IHdpdGgge3gseX0gcG9zaXRpb24gYW5kIHt3aWR0aCwgaGVpZ2h0fVxuICAgICAqIEBwYXJhbSAge1JlY3R9IGJvZHkyIFNlY29uZCBib2R5XG4gICAgICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiB0aGV5IGludGVyc2VjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgc3RhdGljIGludGVyc2VjdHMoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5KSA6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaW50ZXJzZWN0aW9uWCA9IGJvZHkxLnBvc2l0aW9uLnggPCBib2R5Mi5wb3NpdGlvbi54ICsgYm9keTIud2lkdGggXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW50ZXJzZWN0aW9uWSA9IGJvZHkxLnBvc2l0aW9uLnkgPCBib2R5Mi5wb3NpdGlvbi55ICsgYm9keTIuaGVpZ2h0IFxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcblxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uWCAmJiBpbnRlcnNlY3Rpb25ZO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb2xsaWRlKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSwgY29sbGlzaW9uQ2FsbGJhY2s6IEZ1bmN0aW9uKSA6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcbiAgICAgICAgICAgIGNvbGxpc2lvbkNhbGxiYWNrKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRPdmVybGFwKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSk6IFZlY3RvciB7XG4gICAgICAgIGlmICh0aGlzLmludGVyc2VjdHMoYm9keTEsIGJvZHkyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBWZWN0b3IuZnJvbSh7IHg6IDAsIHk6IDAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb3ZlcmxhcFgxID0gYm9keTIucG9zaXRpb24ueCAtIChib2R5MS5wb3NpdGlvbi54ICsgYm9keTEud2lkdGgpO1xuICAgICAgICBsZXQgb3ZlcmxhcFgyID0gKGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCkgLSBib2R5MS5wb3NpdGlvbi54O1xuXG4gICAgICAgIGxldCBvdmVybGFwWTEgPSBib2R5Mi5wb3NpdGlvbi55IC0gKGJvZHkxLnBvc2l0aW9uLnkgKyBib2R5MS5oZWlnaHQpO1xuICAgICAgICBsZXQgb3ZlcmxhcFkyID0gKGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQpIC0gYm9keTEucG9zaXRpb24ueTtcblxuICAgICAgICBsZXQgb3ZlcmxhcFggPSBNYXRoLmFicyhvdmVybGFwWDEpIDwgTWF0aC5hYnMob3ZlcmxhcFgyKSA/IG92ZXJsYXBYMSA6IG92ZXJsYXBYMjtcbiAgICAgICAgbGV0IG92ZXJsYXBZID0gTWF0aC5hYnMob3ZlcmxhcFkxKSA8IE1hdGguYWJzKG92ZXJsYXBZMikgPyBvdmVybGFwWTEgOiBvdmVybGFwWTI7XG5cbiAgICAgICAgcmV0dXJuIFZlY3Rvci5mcm9tKHsgeDogb3ZlcmxhcFgsIHk6IG92ZXJsYXBZIH0pO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vaW5wdXQnO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5pbXBvcnQgeyBCdWxsZXQgfSBmcm9tICcuL2J1bGxldCc7XG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cdHByaXZhdGUgX2xhc3RTaG90IDogRGF0ZSA9IG5ldyBEYXRlKDApO1xuXG5cdHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoMTAsIDEwKSwgMzYsIDM2KTtcblx0cHVibGljIHNwZWVkOiBudW1iZXIgPSAzO1xuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XG5cblx0cHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcblx0ICAgICdpZGxlJyA6IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHQgICAgJ3JpZ2h0JyA6IG5ldyBBbmltYXRpb24oNCwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcblx0fTtcblx0cHJpdmF0ZSBfYnVsbGV0T2Zmc2V0IDogUG9pbnQgPSB7IHg6IDEyLCB5OiAxOCB9O1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xuXHR9XG5cblx0c2hvb3QoKSA6IHZvaWQge1xuXHRcdGlmICh0aGlzLmNhblNob290KCkpIHtcblx0XHRcdHRoaXMuX2xhc3RTaG90ID0gbmV3IERhdGUoKTtcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIHsgXG5cdFx0XHRcdHg6IHRoaXMuYm9keS5wb3NpdGlvbi54ICsgdGhpcy5fYnVsbGV0T2Zmc2V0LngsIFxuXHRcdFx0XHR5OiB0aGlzLmJvZHkucG9zaXRpb24ueSArIHRoaXMuX2J1bGxldE9mZnNldC55IFxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGJ1bGxldFNwYXduLCB0aGlzLl9nYW1lLm1vdXNlLCB0aGlzKTtcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjYW5TaG9vdCgpIDogYm9vbGVhbiB7XG5cdFx0bGV0IGRpZmYgPSB0aGlzLl9nYW1lLmdhbWVUaW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RTaG90LmdldFRpbWUoKTtcblxuXHRcdHJldHVybiBkaWZmID4gdGhpcy5hdHRhY2tTcGVlZDtcblx0fVxuXG5cdGFuaW1hdGUoYW5pbWF0aW9uIDogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGF0ZU1vdmVtZW50KCkgOiB2b2lkIHtcblx0XHRsZXQgaW5wdXQgPSB0aGlzLl9nYW1lLmlucHV0O1xuXG5cdFx0bGV0IG1vdmluZ1ggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF07XG5cdFx0bGV0IG1vdmluZ1kgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gfHwgaW5wdXQuYWN0aW9uc1tBY3Rpb24uRG93bl07XG5cblx0XHRsZXQgc3BlZWQgPSBtb3ZpbmdYICYmIG1vdmluZ1kgPyBNYXRoLnNxcnQodGhpcy5zcGVlZCAqIHRoaXMuc3BlZWQgLyAyKSA6IHRoaXMuc3BlZWQ7XG5cblx0XHRsZXQgZGlyZWN0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XG5cblx0XHRkaXJlY3Rpb24ueCA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLkxlZnRdICA/IC0xIDogMSxcblx0XHRkaXJlY3Rpb24ueSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSA/IC0xIDogMVxuXG5cdFx0ZGlyZWN0aW9uLnggPSBtb3ZpbmdYID8gZGlyZWN0aW9uLnggOiAwO1xuXHRcdGRpcmVjdGlvbi55ID0gbW92aW5nWSA/IGRpcmVjdGlvbi55IDogMDtcblxuXHRcdHRoaXMuYm9keS52ZWxvY2l0eS54ID0gZGlyZWN0aW9uLnggKiBzcGVlZDtcblx0XHR0aGlzLmJvZHkudmVsb2NpdHkueSA9IGRpcmVjdGlvbi55ICogc3BlZWQ7XG5cblx0XHRjb25zb2xlLmxvZyhcIlBsYXllciBzcGVlZDogXCIgKyB0aGlzLmJvZHkuc3BlZWQpO1xuXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xuXG5cdFx0aWYgKGlucHV0LmFjdGlvbnNbQWN0aW9uLkF0dGFja10pIHtcblx0ICAgICAgICB0aGlzLnNob290KCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb24oKSB7XG5cdFx0bGV0IGFuaW1hdGlvbiA9IHRoaXMuX2dhbWUubW91c2UueCA+IHRoaXMuYm9keS5wb3NpdGlvbi54ID8gJ3JpZ2h0JyA6ICdsZWZ0JztcblxuXHRcdHRoaXMuYW5pbWF0ZShhbmltYXRpb24pO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLnVwYXRlTW92ZW1lbnQoKTtcblx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbigpO1xuXHR9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcblx0eCA6IG51bWJlcjtcblx0eSA6IG51bWJlcjtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY3QgeyBcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgVmVjdG9yIHtcblx0eCA6IG51bWJlciA9IDA7XG5cdHkgOiBudW1iZXIgPSAwO1xuXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cdH1cblxuXHRwdWJsaWMgc2V0KHZhbHVlOiBudW1iZXIgfCBWZWN0b3IpOiB2b2lkIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHR0aGlzLnggPSB0aGlzLnkgPSB2YWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy54ID0gdmFsdWUueDtcblx0XHRcdHRoaXMueSA9IHZhbHVlLnk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGNsb25lKCk6IFZlY3RvciB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpO1xuXHR9XG5cblx0cHVibGljIG1hZ25pdHVkZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcblx0fVxuXG5cdHN0YXRpYyBhZGQodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYzEueCArIHZlYzIueCwgdmVjMS55ICsgdmVjMi55KTtcblx0fVxuXG5cdHN0YXRpYyBzdWJ0cmFjdCh2ZWMxOiBWZWN0b3IsIHZlYzI6IFZlY3Rvcik6IFZlY3RvciB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjMS54IC0gdmVjMi54LCB2ZWMxLnkgLSB2ZWMyLnkpO1xuXHR9XG5cblx0c3RhdGljIG11bHRpcGx5KHZlYzogVmVjdG9yLCBzY2FsYXI6IG51bWJlcikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYy54ICogc2NhbGFyLCB2ZWMueSAqIHNjYWxhcik7XG5cdH1cblxuXHRzdGF0aWMgZnJvbShwb2ludDogUG9pbnQpIHtcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcihwb2ludC54LCBwb2ludC55KTtcblx0fVxufSIsImltcG9ydCB7IEdhbWUsIENvbmZpZyB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gJy4vdmlld3BvcnQnO1xuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cblx0cHJpdmF0ZSBfdGlsZSA9IHtcblx0XHR3aWR0aCA6IDMwLFxuXHRcdGhlaWdodDogMzBcblx0fVxuXG5cblx0LyoqXG5cdCAqXHRTcHJpdGVzIEkgdXNlIGZvciBhIGRldmVsb3BtZW50IHdlcmUgY3JlYXRlZCBieSBDb2R5IFNoZXBwIGZvciBoaXMgZ2FtZSBEZW50YWwgRGVmZW5kZXI6IFNhZ2Egb2YgdGhlIENhbmR5IEhvcmRlLlxuXHQgKlx0UGxlYXNlIGNoZWNrIGhpcyBnaXRodWIgcmVwbzogaHR0cHM6Ly9naXRodWIuY29tL2NzaGVwcC9jYW5keWphbS9cblx0ICovXG5cdHByaXZhdGUgX3Jlc291cmNlcyA9IHtcblx0XHQncGxheWVyJyA6ICcuL2ltZy9wbGF5ZXIucG5nJyxcblx0XHQnZW5lbXknIDogJy4vaW1nL2VuZW15LnBuZycsXG5cdFx0J2J1bGxldCcgOiAnLi9pbWcvYnVsbGV0LnBuZycsXG5cdFx0J3dhbGwnOiAnLi9pbWcvdHJlZS1yZWQtMS5wbmcnXG5cblx0fVxuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRpbGUocG9zOiBQb2ludCwgY29sb3I6IHN0cmluZykgOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQucmVjdChwb3MueCwgcG9zLnksIHRoaXMuX3RpbGUud2lkdGgsIHRoaXMuX3RpbGUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyVGlsZXMoKSA6IHZvaWQge1xuICAgICAgICBsZXQgY29sb3JzID0gW1wiIzc4NWM5OFwiLCBcIiM2OTRmODhcIl07XG5cbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLl9nYW1lLm1hcC53aWR0aDsgeCArPSB0aGlzLl90aWxlLndpZHRoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuX2dhbWUubWFwLmhlaWdodDsgeSArPSB0aGlzLl90aWxlLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIGxldCB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcbiAgICAgICAgICAgICAgICBsZXQgeUluZGV4ID0gKHkgLyB0aGlzLl90aWxlLmhlaWdodCkgJSAyO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRpbGVQb3MgPSB0aGlzLmNhbWVyYU9mZnNldCh7eCwgeX0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaWxlKHRpbGVQb3MsIGNvbG9yc1t4SW5kZXggXiB5SW5kZXhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2FtZXJhT2Zmc2V0KHBvczogUG9pbnQpIDogUG9pbnQge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHBvcy54IC0gc2VsZi5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcbiAgICAgICAgfTtcbiAgICB9XG5cblx0cHJpdmF0ZSByZW5kZXJIZWxwZXIoc291cmNlIDogc3RyaW5nLCBjb2xsZWN0aW9uIDogRW50aXR5W10pIHtcblx0XHRsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cdFx0aW1nLnNyYyA9IHNvdXJjZTtcblxuXHRcdGNvbGxlY3Rpb24uZm9yRWFjaCgoZSkgPT4ge1xuXHRcdFx0bGV0IGZyYW1lID0gZS5jdXJyZW50QW5pbWF0aW9uLmN1cnJlbnRGcmFtZTtcblx0XHRcdGxldCBwb3MgPSB0aGlzLmNhbWVyYU9mZnNldChlLmJvZHkucG9zaXRpb24pO1xuXG5cdFx0XHRpZiAodGhpcy5fZ2FtZS5jb25maWcuc2hvd0FBQkIpIHtcblx0XHRcdFx0dGhpcy5yZW5kZXJBQUJCKG5ldyBCb2R5KG5ldyBWZWN0b3IocG9zLngsIHBvcy55KSwgZS5ib2R5LndpZHRoLCBlLmJvZHkuaGVpZ2h0KSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2dhbWUuY29udGV4dC5kcmF3SW1hZ2UoXG5cdFx0XHRcdGltZyxcblx0XHRcdFx0ZnJhbWUueCwgZnJhbWUueSxcblx0XHRcdFx0ZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCxcblx0XHRcdFx0cG9zLngsIHBvcy55LFxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0XG5cdFx0XHQpO1xuXG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckhwQmFyKGU6IEVudGl0eSkge1xuXHRcdGxldCBiYXJTaXplID0geyB3aWR0aDogNTAsIGhlaWdodDogNSB9O1xuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XG5cdFx0bGV0IHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KFZlY3Rvci5zdWJ0cmFjdChlLmJvZHkucG9zaXRpb24sIG5ldyBWZWN0b3IoNSwgMTUpKSk7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LnJlY3QoXG5cdFx0XHRwb3MueCxcblx0XHRcdHBvcy55LFxuXHRcdFx0YmFyU2l6ZS53aWR0aCxcblx0XHRcdGJhclNpemUuaGVpZ2h0XG5cdFx0KTtcblxuXHRcdHZhciBncmQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQocG9zLngsIHBvcy55LCBwb3MueCArIGJhclNpemUud2lkdGgsIHBvcy55ICsgYmFyU2l6ZS5oZWlnaHQpO1xuXHRcdGdyZC5hZGRDb2xvclN0b3AoMCwgXCJyZWRcIik7XG5cdFx0Z3JkLmFkZENvbG9yU3RvcChlLmhlYWx0aCAvIDEwMCwgXCJyZWRcIik7XG5cdFx0Z3JkLmFkZENvbG9yU3RvcChlLmhlYWx0aCAvIDEwMCwgXCJibGFja1wiKTtcblx0XHRncmQuYWRkQ29sb3JTdG9wKDEsIFwiYmxhY2tcIik7XG5cblx0XHRjdHguZmlsbFN0eWxlID0gZ3JkO1xuXHRcdGN0eC5maWxsKCk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckFBQkIoYm9keTogQm9keSkge1xuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgwLjUsIDAuNSk7XG5cdFx0Y3R4LnJlY3QoXG5cdFx0XHRib2R5LnBvc2l0aW9uLngsXG5cdFx0XHRib2R5LnBvc2l0aW9uLnksXG5cdFx0XHRib2R5LndpZHRoLFxuXHRcdFx0Ym9keS5oZWlnaHRcblx0XHQpO1xuXG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcblx0XHRjdHgubGluZVdpZHRoID0gMTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtMC41LCAtMC41KTtcblx0fVxuXG5cdHJlbmRlcigpIDogdm9pZCB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0dGhpcy5yZW5kZXJUaWxlcygpO1xuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snYnVsbGV0J10sIHRoaXMuX2dhbWUuYnVsbGV0cyk7XG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydlbmVteSddLCB0aGlzLl9nYW1lLmVuZW1pZXMpO1xuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKGUgPT4ge1xuXHRcdFx0dGhpcy5yZW5kZXJIcEJhcihlKTtcblx0XHR9KTtcblxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1sncGxheWVyJ10sIFt0aGlzLl9nYW1lLnBsYXllcl0pO1xuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snd2FsbCddLCB0aGlzLl9nYW1lLndhbGxzKTtcblx0fVxuXG5cdGNsZWFyKCkgOiB2b2lkIHtcblx0XHRsZXQgdyA9IHRoaXMuX2dhbWUuY2FudmFzLndpZHRoO1xuXHRcdGxldCBoID0gdGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0O1xuXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcblx0fVxufVxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVyIHtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdH1cblxuXHRwcml2YXRlIGFsbEVudGl0aWVzKCkgOiBFbnRpdHlbXSB7XG5cdFx0cmV0dXJuIDxFbnRpdHlbXT4gQXJyYXkucHJvdG90eXBlLmNvbmNhdChcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cyxcblx0XHRcdHRoaXMuX2dhbWUuZW5lbWllcyxcblx0XHRcdHRoaXMuX2dhbWUucGxheWVyXG5cdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9ucygpIDogdm9pZCB7XG5cdFx0bGV0IGVudGl0aWVzID0gdGhpcy5hbGxFbnRpdGllcygpO1xuXG5cdFx0ZW50aXRpZXMuZm9yRWFjaCgoZSk9PiB7IGUuY3VycmVudEFuaW1hdGlvbi51cGRhdGUodGhpcy5fZ2FtZS5nYW1lVGltZSk7IH0pO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVFbnRpdGllcygpIDogdm9pZCB7XG5cdFx0bGV0IGVudGl0aWVzID0gdGhpcy5hbGxFbnRpdGllcygpO1xuXG5cdFx0ZW50aXRpZXMuZm9yRWFjaChlID0+IHsgZS51cGRhdGUoKTsgfSk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZURlYWQoKSA6IHZvaWQge1xuXHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKGUgPT4geyB0aGlzLnJlbW92ZURlYWQoZSwgdGhpcy5fZ2FtZS5idWxsZXRzKTsgfSlcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuZW5lbWllcyk7IH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZURlYWQoZTogRW50aXR5LCBjb2xsZWN0aW9uOiBFbnRpdHlbXSkge1xuXHRcdGlmIChlLmFsaXZlID09PSBmYWxzZSkge1xuXHRcdFx0bGV0IGVJbmRleCA9IGNvbGxlY3Rpb24uaW5kZXhPZihlKTtcblxuXHRcdFx0aWYgKGVJbmRleCA+IC0xKSB7XG5cdFx0XHRcdGNvbGxlY3Rpb24uc3BsaWNlKGVJbmRleCwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbnMoKTtcblx0XHR0aGlzLnVwZGF0ZUVudGl0aWVzKCk7XG5cdFx0dGhpcy51cGRhdGVEZWFkKCk7XG5cdFx0dGhpcy5fZ2FtZS52aWV3cG9ydC50YXJnZXQgPSB0aGlzLl9nYW1lLnBsYXllci5ib2R5LnBvc2l0aW9uO1xuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudXBkYXRlKCk7XG5cdFx0dGhpcy5fZ2FtZS5jb2xsaXNpb25zLnVwZGF0ZSgpO1xuXHRcdHRoaXMuX2dhbWUuaW5wdXQudXBkYXRlKCk7XG5cdH1cbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge307XG5cbmV4cG9ydCBjbGFzcyBVdGlsIHtcblx0c3RhdGljIGNsYW1wKHZhbHVlIDogbnVtYmVyLCBtaW4gOiBudW1iZXIsIG1heCA6IG51bWJlcikgOiBudW1iZXIge1xuXHRcdGlmICh2YWx1ZSA+IG1heCkgeyByZXR1cm4gbWF4OyB9XG5cdFx0aWYgKHZhbHVlIDwgbWluKSB7IHJldHVybiBtaW47IH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxufVxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0cHVibGljIHRhcmdldDogUG9pbnQ7XG5cdHB1YmxpYyBwb3NpdGlvbjogUG9pbnQgPSB7IHggOiAwLCB5IDogMCB9O1xuXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XG5cdHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XG5cdHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xuXHRcdHRoaXMuX2hlaWdodCA9IGdhbWVJbnN0YW5jZS5jYW52YXMuaGVpZ2h0O1xuXHR9XG5cblx0cHJpdmF0ZSBjYWxjdWxhdGVQb3NpdGlvbigpIDogdm9pZCB7XG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC54IC0gdGhpcy5fd2lkdGggLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC53aWR0aCAtIHRoaXMuX3dpZHRoKTtcblx0XHR0aGlzLnBvc2l0aW9uLnkgPSBVdGlsLmNsYW1wKHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHQpO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XG5cdH1cbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdhbGwgZXh0ZW5kcyBFbnRpdHkge1xyXG4gICAgcHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigpLCAxNTEsIDIxMSk7XHJcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDE1MSwgMjExKSk7XHJcblxyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFBvaW50KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmJvZHkucG9zaXRpb24gPSBWZWN0b3IuZnJvbShwb3NpdGlvbik7XHJcbiAgICB9XHJcbn0iXX0=
