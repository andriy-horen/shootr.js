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
const Random = require('./random');
class Enemy extends entity_1.Entity {
    constructor(gameInstance, target) {
        super();
        this._animations = {
            'idle': new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'right': new animation_1.Animation(4, 0, frame_1.Frame.create(0, 0, 36, 36)),
            'left': new animation_1.Animation(4, 1, frame_1.Frame.create(0, 0, 36, 36))
        };
        this._lastHit = new Date(0);
        this.speed = 2.5;
        this.dagameAmount = 5;
        this.attackSpeed = 250;
        this._game = gameInstance;
        this.target = target;
        let randomX = Random.getRandomInt(0, this._game.canvas.width);
        let randomY = Random.getRandomInt(0, this._game.canvas.height);
        this.body = new body_1.Body(new primitives_1.Vector(randomX, randomY), 36, 36);
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
},{"./animation":1,"./body":2,"./entity":7,"./frame":8,"./primitives":14,"./random":15}],7:[function(require,module,exports){
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
        for (let i = 0; i < 10; i++) {
            this.enemies.push(new enemy_1.Enemy(this, this.player));
        }
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
},{"./collision-manager":4,"./enemy":6,"./input":10,"./map":11,"./player":13,"./renderer":16,"./updater":17,"./viewport":19,"./wall":20}],10:[function(require,module,exports){
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
        console.log('Player speed: ' + this.body.speed);
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
        if (typeof value === 'number') {
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
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomInt = getRandomInt;
},{}],16:[function(require,module,exports){
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
        let colors = ['#785c98', '#694f88'];
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
    renderHud() {
        let offset = 20;
        let barSize = { width: 150, height: 10 };
        let ctx = this._game.context;
        ctx.beginPath();
        ctx.rect(offset, this._game.canvas.height - offset * 1.2, barSize.width, barSize.height);
        var grd = ctx.createLinearGradient(offset, this._game.canvas.height - offset, offset + barSize.width, this._game.canvas.height - offset + barSize.height);
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
        ctx.fillText(this._game.score.toString(), offset, this._game.canvas.height - offset * 1.5);
    }
    renderAABB(body) {
        let ctx = this._game.context;
        ctx.beginPath();
        ctx.translate(0.5, 0.5);
        ctx.rect(body.position.x, body.position.y, body.width, body.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.translate(-0.5, -0.5);
    }
    render() {
        this.clear();
        this.renderTiles();
        this.renderHelper(this._resources['bullet'], this._game.bullets);
        this.renderHelper(this._resources['enemy'], this._game.enemies);
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
},{"./body":2,"./primitives":14}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"./util":18}],20:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JhbmRvbS50cyIsInNyYy9qcy9yZW5kZXJlci50cyIsInNyYy9qcy91cGRhdGVyLnRzIiwic3JjL2pzL3V0aWwudHMiLCJzcmMvanMvdmlld3BvcnQudHMiLCJzcmMvanMvd2FsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNDQSxNQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUVqQztJQW1CQyxZQUFZLE1BQWMsRUFBRSxHQUFXLEVBQUUsS0FBWTtRQVo5QyxVQUFLLEdBQVksQ0FBQyxDQUFDO1FBTW5CLFNBQUksR0FBWSxJQUFJLENBQUM7UUFFcEIsa0JBQWEsR0FBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUsxQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQzVELENBQUM7SUFFRCxVQUFVLENBQUMsSUFBVztRQUNyQixJQUFJLGNBQWMs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LEdBQWMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBS3BGLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU8sV0FBVyxDQUFDLFFBQWU7UUFDNUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTdDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3BCLENBQUM7QUFDRixDQUFDO0FBbENZLGNBQU0sU0FrQ2xCLENBQUE7OztBQ3hDRCwwQkFBd0IsV0FBVyxDQUFDLENBQUE7QUFFcEM7SUFHQyxZQUFZLFlBQW1CO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNO1FBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO2dCQUNqQyxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUU7b0JBQ3hDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRWpELE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFZCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDbkQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixpQkFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFFL0MsSUFBSSxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFakUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNCLGlCQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtvQkFDL0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNWLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7QUFDRixDQUFDO0FBN0NZLHdCQUFnQixtQkE2QzVCLENBQUE7OztBQ2hEWSxpQkFBUyxHQUFHLElBQUksQ0FBQzs7O0FDQzlCLHlCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUVsQyw2QkFBOEIsY0FBYyxDQUFDLENBQUE7QUFDN0MsdUJBQXFCLFFBQVEsQ0FBQyxDQUFBO0FBRzlCLHdCQUFzQixTQUFTLENBQUMsQ0FBQTtBQUNoQyw0QkFBMEIsYUFBYSxDQUFDLENBQUE7QUFFeEMsTUFBWSxNQUFNLFdBQU0sVUFBVSxDQUFDLENBQUE7QUFFbkMsb0JBQTJCLGVBQU07SUFpQmhDLFlBQVksWUFBa0IsRUFBRSxNQUFjO1FBQzdDLE9BQU8sQ0FBQztRQWpCRCxnQkFBVyxHQUFvQjtZQUNyQyxNQUFNLEVBQUcsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCxPQUFPLEVBQUcsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCxNQUFNLEVBQUcsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN0RCxDQUFDO1FBQ00sYUFBUSxHQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSzlCLFVBQUssR0FBWSxHQUFHLENBQUM7UUFDckIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsZ0JBQVcsR0FBVyxHQUFHLENBQUM7UUFPN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUQsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLG1CQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxPQUFPLENBQUMsU0FBa0I7UUFDekIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUdELFdBQVcsQ0FBQyxRQUFlO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV4RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM1RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUU1RCxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRVUsTUFBTTtRQUNWLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFekUsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzdCLENBQUM7SUFFRCxHQUFHLENBQUMsTUFBYztRQUNkLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXZDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUVKLE1BQU07UUFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRzdDLENBQUM7QUFDRixDQUFDO0FBM0VZLGFBQUssUUEyRWpCLENBQUE7OztBQ3BGRDtJQUFBO1FBQ1MsWUFBTyxHQUFZLEdBQUcsQ0FBQztRQUN2QixXQUFNLEdBQWEsSUFBSSxDQUFDO0lBd0NqQyxDQUFDO0lBbENBLElBQUksTUFBTTtRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNwQixDQUFDO0lBRU8sVUFBVSxDQUFDLE1BQWM7UUFDaEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUM7UUFDeEIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixDQUFDO0lBQ0YsQ0FBQztJQUVELElBQUk7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQWUsRUFBRSxRQUFnQjtRQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksQ0FBQyxNQUFlO1FBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELE1BQU0sS0FBSSxDQUFDO0FBQ1osQ0FBQztBQTFDcUIsY0FBTSxTQTBDM0IsQ0FBQTs7O0FDM0NEO0lBQUE7UUFDQyxVQUFLLEdBQVksQ0FBQyxDQUFDO1FBQ25CLE1BQUMsR0FBVyxDQUFDLENBQUM7UUFDZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ2QsVUFBSyxHQUFXLENBQUMsQ0FBQztRQUNsQixXQUFNLEdBQVcsQ0FBQyxDQUFDO0lBY3BCLENBQUM7SUFYQSxPQUFPLE1BQU0sQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQ2hFLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7UUFFeEIsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWixLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNaLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0YsQ0FBQztBQW5CWSxhQUFLLFFBbUJqQixDQUFBOzs7QUNwQkQsb0NBQWlDLHFCQUFxQixDQUFDLENBQUE7QUFDdkQsd0JBQXNCLFNBQVMsQ0FBQyxDQUFBO0FBQ2hDLHVCQUFxQixRQUFRLENBQUMsQ0FBQTtBQUM5Qix3QkFBc0IsU0FBUyxDQUFDLENBQUE7QUFDaEMsc0JBQW9CLE9BQU8sQ0FBQyxDQUFBO0FBQzVCLHlCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUVsQywyQkFBeUIsWUFBWSxDQUFDLENBQUE7QUFDdEMsMEJBQXdCLFdBQVcsQ0FBQyxDQUFBO0FBQ3BDLDJCQUF5QixZQUFZLENBQUMsQ0FBQTtBQU90QztJQTBCQyxZQUFZLE1BQWM7UUF0Qm5CLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFFbEIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixZQUFPLEdBQVksRUFBRSxDQUFDO1FBQ3RCLFVBQUssR0FBVyxFQUFFLENBQUM7UUFHbkIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQVFsQixVQUFLLEdBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQVFwQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUF1QixRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLFNBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLG9DQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBRWhGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksV0FBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxJQUFJO1FBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRTNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxHQUFHO1FBQ0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVaLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7SUFDRixDQUFDO0lBRUQsSUFBSTtRQUNILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDO0lBQ0YsQ0FBQztBQUNGLENBQUM7QUFyRVksWUFBSSxPQXFFaEIsQ0FBQTtBQUVELElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO0lBQ25CLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLFFBQVEsRUFBRSxLQUFLO0NBQ2YsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7QUN6RlgsV0FBWSxNQUFNO0lBQ2pCLCtCQUFFLENBQUE7SUFDRixtQ0FBSSxDQUFBO0lBQ0osbUNBQUksQ0FBQTtJQUNKLHFDQUFLLENBQUE7SUFDTCx1Q0FBTSxDQUFBO0FBQ1AsQ0FBQyxFQU5XLGNBQU0sS0FBTixjQUFNLFFBTWpCO0FBTkQsSUFBWSxNQUFNLEdBQU4sY0FNWCxDQUFBO0FBRUQsSUFBSyxHQVNKO0FBVEQsV0FBSyxHQUFHO0lBQ1Asd0JBQU0sQ0FBQTtJQUNOLHdCQUFNLENBQUE7SUFDTix3QkFBTSxDQUFBO0lBQ04sd0JBQU0sQ0FBQTtJQUNOLDBCQUFPLENBQUE7SUFDUCw4QkFBUyxDQUFBO0lBQ1QsOEJBQVMsQ0FBQTtJQUNULGdDQUFVLENBQUE7QUFDWCxDQUFDLEVBVEksR0FBRyxLQUFILEdBQUcsUUFTUDtBQUVEO0lBZ0JDLFlBQVksWUFBbUI7UUFmdkIsY0FBUyxHQUFpQjtZQUNqQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxNQUFNLENBQUMsRUFBRTtZQUNuQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxNQUFNLENBQUMsSUFBSTtZQUNyQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxNQUFNLENBQUMsSUFBSTtZQUNyQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxNQUFNLENBQUMsS0FBSztZQUN0QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRyxNQUFNLENBQUMsRUFBRTtZQUNwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRyxNQUFNLENBQUMsSUFBSTtZQUN4QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRyxNQUFNLENBQUMsSUFBSTtZQUN4QixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRyxNQUFNLENBQUMsS0FBSztTQUMxQixDQUFDO1FBRUssWUFBTyxHQUFrQixFQUFFLENBQUM7UUFFM0IsY0FBUyxHQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFHekMsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFFMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVsRixRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLENBQUMsR0FBUSxFQUFFLE1BQWM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVE7UUFDZCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztJQUNGLENBQUM7SUFFTyxTQUFTLENBQUMsQ0FBZ0I7UUFDakMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFckMsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFFNUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BCLENBQUM7SUFDRixDQUFDO0lBRU8sT0FBTyxDQUFDLENBQWdCO1FBQy9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRTdCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixDQUFDO0lBQ0YsQ0FBQztJQUVPLFdBQVcsQ0FBQyxDQUFhO1FBQ2hDLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQztRQUVyQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUVuQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDcEIsQ0FBQztJQUNGLENBQUM7SUFFTyxTQUFTLENBQUMsQ0FBYTtRQUM5QixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFFckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUVwQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDcEIsQ0FBQztJQUNGLENBQUM7SUFHTyxnQkFBZ0IsQ0FBQyxDQUFhO1FBQ3JDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFFN0QsSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNaLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJO1lBQ2hDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHO1NBQ2hDLENBQUM7UUFFRixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRztZQUNyQixDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEQsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BELENBQUE7SUFDRixDQUFDO0lBRU0sTUFBTTtRQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHO1lBQ2xCLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRCxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEQsQ0FBQTtJQUNGLENBQUM7QUFDRixDQUFDO0FBckdZLGFBQUssUUFxR2pCLENBQUE7OztBQzVIRDtJQUFBO1FBQ1EsVUFBSyxHQUFZLElBQUksQ0FBQztRQUN0QixXQUFNLEdBQVksSUFBSSxDQUFDO0lBQy9CLENBQUM7QUFBRCxDQUFDO0FBSFksV0FBRyxNQUdmLENBQUE7OztBQ0ZELDZCQUF1QixjQUFjLENBQUMsQ0FBQTtBQUd0QztJQU9JLE9BQU8sVUFBVSxDQUFDLEtBQVcsRUFBRSxLQUFXO1FBQ3RDLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLO2VBQzdELEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU07ZUFDOUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUUzRCxNQUFNLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQztJQUMxQyxDQUFDO0lBRUQsT0FBTyxPQUFPLENBQUMsS0FBVyxFQUFFLEtBQVcsRUFBRSxpQkFBMkI7UUFDaEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLGlCQUFpQixFQUFFLENBQUM7WUFFcEIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsT0FBTyxVQUFVLENBQUMsS0FBVyxFQUFFLEtBQVc7UUFDdEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsbUJBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRSxJQUFJLFNBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVwRSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRSxJQUFJLFNBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVyRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUNqRixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUVqRixNQUFNLENBQUMsbUJBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7QUFDTCxDQUFDO0FBM0NZLGVBQU8sVUEyQ25CLENBQUE7OztBQzlDRCx5QkFBdUIsVUFBVSxDQUFDLENBQUE7QUFDbEMsNkJBQThCLGNBQWMsQ0FBQyxDQUFBO0FBQzdDLHdCQUF1QixTQUFTLENBQUMsQ0FBQTtBQUNqQyx1QkFBcUIsUUFBUSxDQUFDLENBQUE7QUFDOUIseUJBQXVCLFVBQVUsQ0FBQyxDQUFBO0FBQ2xDLHdCQUFzQixTQUFTLENBQUMsQ0FBQTtBQUVoQyw0QkFBMEIsYUFBYSxDQUFDLENBQUE7QUFJeEMscUJBQTRCLGVBQU07SUFnQmpDLFlBQVksWUFBa0I7UUFDN0IsT0FBTyxDQUFDO1FBZkQsY0FBUyxHQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhDLFNBQUksR0FBVSxJQUFJLFdBQUksQ0FBQyxJQUFJLG1CQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRCxVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsR0FBRyxDQUFDO1FBR2pCLGdCQUFXLEdBQW9CO1lBQ25DLE1BQU0sRUFBRyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sRUFBRyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sRUFBRyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzNELENBQUM7UUFDTSxrQkFBYSxHQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFLaEQsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFFcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsS0FBSztRQUNKLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzVCLElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDOUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDOUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxDQUFDO0lBQ0YsQ0FBQztJQUVPLFFBQVE7UUFDZixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXBFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUNoQyxDQUFDO0lBRUQsT0FBTyxDQUFDLFNBQWtCO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTyxhQUFhO1FBQ3BCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRTdCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXJFLElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVyRixJQUFJLFNBQVMsR0FBVyxJQUFJLG1CQUFNLEVBQUUsQ0FBQztRQUVyQyxTQUFTLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDbEQsU0FBUyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFL0MsU0FBUyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsU0FBUyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUUzQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVuQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLENBQUM7SUFDRixDQUFDO0lBRU8sZUFBZTtRQUN0QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFN0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsTUFBTTtRQUNMLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztJQUNGLENBQUM7QUFDRixDQUFDO0FBeEZZLGNBQU0sU0F3RmxCLENBQUE7OztBQ3ZGRDtJQUlDLFlBQVksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQVcsQ0FBQztRQUh4QyxNQUFDLEdBQVksQ0FBQyxDQUFDO1FBQ2YsTUFBQyxHQUFZLENBQUMsQ0FBQztRQUdkLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRU0sR0FBRyxDQUFDLEtBQXNCO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN6QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7SUFDRixDQUFDO0lBRU0sS0FBSztRQUNYLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sU0FBUztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsT0FBTyxHQUFHLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDcEMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsT0FBTyxRQUFRLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDekMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsT0FBTyxRQUFRLENBQUMsR0FBVyxFQUFFLE1BQWM7UUFDMUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDLEtBQVk7UUFDdkIsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7QUFDRixDQUFDO0FBekNZLGNBQU0sU0F5Q2xCLENBQUE7OztBQ3RERCxzQkFBNkIsR0FBVyxFQUFFLEdBQVc7SUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUM3RCxDQUFDO0FBRmUsb0JBQVksZUFFM0IsQ0FBQTs7O0FDQ0QsNkJBQThCLGNBQWMsQ0FBQyxDQUFBO0FBRTdDLHVCQUFxQixRQUFRLENBQUMsQ0FBQTtBQUU5QjtJQXFCQyxZQUFZLFlBQWtCO1FBbEJ0QixVQUFLLEdBQUc7WUFDZixLQUFLLEVBQUcsRUFBRTtZQUNWLE1BQU0sRUFBRSxFQUFFO1NBQ1YsQ0FBQTtRQU9PLGVBQVUsR0FBRztZQUNwQixRQUFRLEVBQUcsa0JBQWtCO1lBQzdCLE9BQU8sRUFBRyxpQkFBaUI7WUFDM0IsUUFBUSxFQUFHLGtCQUFrQjtZQUM3QixNQUFNLEVBQUUsc0JBQXNCO1NBRTlCLENBQUE7UUFHQSxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRU8sVUFBVSxDQUFDLEdBQVUsRUFBRSxLQUFhO1FBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTyxXQUFXO1FBQ2YsSUFBSSxNQUFNLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFcEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDOUQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFekMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFDLEdBQUEsQ0FBQyxFQUFFLEdBQUEsQ0FBQyxFQUFDLENBQUMsQ0FBQztnQkFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxHQUFVO1FBQzNCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixNQUFNLENBQUM7WUFDSCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1QyxDQUFDO0lBQ04sQ0FBQztJQUVJLFlBQVksQ0FBQyxNQUFlLEVBQUUsVUFBcUI7UUFDMUQsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUVqQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1lBQzVDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU3QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksV0FBSSxDQUFDLElBQUksbUJBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEYsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FDM0IsR0FBRyxFQUNILEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFDaEIsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxFQUN6QixHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQ1osS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUN6QixDQUFDO1FBRUgsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBR08sU0FBUztRQUNoQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFaEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUN6QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUU3QixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLElBQUksQ0FDUCxNQUFNLEVBQ04sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxHQUFHLEVBQ3ZDLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FDZCxDQUFDO1FBR0YsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFKLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1RCxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUQsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFN0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDcEIsR0FBRyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7UUFDNUIsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1gsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWIsR0FBRyxDQUFDLElBQUksR0FBRyxlQUFlLENBQUM7UUFDekIsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDNUIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztJQUU1RixDQUFDO0lBRU8sVUFBVSxDQUFDLElBQVU7UUFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFFN0IsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ2YsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsTUFBTSxDQUNYLENBQUM7UUFFRixHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDYixHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsS0FBSztRQUNKLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFFakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7QUFDRixDQUFDO0FBckpZLGdCQUFRLFdBcUpwQixDQUFBOzs7QUN6SkQ7SUFHQyxZQUFZLFlBQW1CO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDO0lBQzNCLENBQUM7SUFFTyxXQUFXO1FBQ2xCLE1BQU0sQ0FBWSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FDakIsQ0FBQztJQUNILENBQUM7SUFFTyxnQkFBZ0I7UUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWxDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVPLGNBQWM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWxDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTyxVQUFVO1FBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdFLENBQUM7SUFFTyxVQUFVLENBQUMsQ0FBUyxFQUFFLFVBQW9CO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5DLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNCLENBQUM7QUFDRixDQUFDO0FBbkRZLGVBQU8sVUFtRG5CLENBQUE7OztBQ3BERCxrQkFBd0IsQ0FBQztBQUFULFlBQUksT0FBSyxDQUFBO0FBQUEsQ0FBQztBQUUxQjtJQUNDLE9BQU8sS0FBSyxDQUFDLEtBQWMsRUFBRSxHQUFZLEVBQUUsR0FBWTtRQUN0RCxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUFDLENBQUM7UUFFaEMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDRixDQUFDO0FBUFksWUFBSSxPQU9oQixDQUFBOzs7QUNSRCx1QkFBcUIsUUFBUSxDQUFDLENBQUE7QUFFOUI7SUFRQyxZQUFZLFlBQWtCO1FBTnZCLGFBQVEsR0FBVSxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDO1FBT3pDLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMzQyxDQUFDO0lBRU8saUJBQWlCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsV0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6RyxDQUFDO0lBRUQsTUFBTTtRQUNMLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzFCLENBQUM7QUFDRixDQUFDO0FBdEJZLGdCQUFRLFdBc0JwQixDQUFBOzs7QUMzQkQseUJBQXVCLFVBQVUsQ0FBQyxDQUFBO0FBQ2xDLDRCQUEwQixhQUFhLENBQUMsQ0FBQTtBQUN4Qyx3QkFBc0IsU0FBUyxDQUFDLENBQUE7QUFDaEMsdUJBQXFCLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLDZCQUE4QixjQUFjLENBQUMsQ0FBQTtBQUU3QyxtQkFBMEIsZUFBTTtJQUk1QixZQUFZLFFBQWU7UUFDdkIsT0FBTyxDQUFDO1FBSkwsU0FBSSxHQUFVLElBQUksV0FBSSxDQUFDLElBQUksbUJBQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsRCxxQkFBZ0IsR0FBYyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFJaEYsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztBQUNMLENBQUM7QUFSWSxZQUFJLE9BUWhCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0ICogYXMgQ29uc3QgZnJvbSAnLi9jb25zdCc7XHJcblxyXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uIHtcclxuXHRwdWJsaWMgY3VycmVudEZyYW1lIDogRnJhbWU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE51bWJlciBvZiBmcmFtZXMgcGVyIHNlY29uZFxyXG5cdCAqIEB0eXBlIHtudW1iZXJ9XHJcblx0ICovXHJcblx0cHVibGljIHNwZWVkIDogbnVtYmVyID0gMDtcclxuXHQvKipcclxuXHQgKiBUT0RPOiBJbXBsZW1lbnQsIGZpZWxkIGlzIG5vdCB1c2VkIFxyXG5cdCAqIFNldCB0byB0cnVlIHRvIG1ha2UgYW5pbWF0aW9uIGxvb3BlZCwgZmFsc2UgLSBmb3Igb25lIGN5Y2xlIG9ubHlcclxuXHQgKiBAdHlwZSB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRwdWJsaWMgbG9vcDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG5cdHByaXZhdGUgX2xhc3RBbmltYXRlZCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHRwcml2YXRlIF9yb3cgOiBudW1iZXI7XHJcblx0cHJpdmF0ZSBfbGVuZ3RoIDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihsZW5ndGg6IG51bWJlciwgcm93OiBudW1iZXIsIGZyYW1lOiBGcmFtZSkge1xyXG5cdFx0dGhpcy5fcm93ID0gcm93O1xyXG5cdFx0dGhpcy5fbGVuZ3RoID0gbGVuZ3RoO1xyXG5cclxuXHRcdHRoaXMuY3VycmVudEZyYW1lID0gZnJhbWU7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS55ID0gdGhpcy5fcm93ICogdGhpcy5jdXJyZW50RnJhbWUuaGVpZ2h0O1xyXG5cdH1cclxuXHJcblx0Y2FuQW5pbWF0ZSh0aW1lIDogRGF0ZSkgOiBib29sZWFuIHtcclxuXHRcdGxldCBhbmltYXRpb25EZWx0YSA9IHRpbWUuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdEFuaW1hdGVkLmdldFRpbWUoKTtcclxuXHJcblx0XHRyZXR1cm4gYW5pbWF0aW9uRGVsdGEgPiB0aGlzLmRlbGF5O1xyXG5cdH1cclxuXHJcblx0Z2V0IGRlbGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gQ29uc3QuTVNfSU5fU0VDIC8gdGhpcy5zcGVlZDtcclxuXHR9XHJcblxyXG5cdG5leHQoKTogdm9pZCB7XHJcblx0XHRsZXQgaW5kZXggPSB0aGlzLmN1cnJlbnRGcmFtZS5pbmRleDtcclxuXHJcblx0XHRpbmRleCA9IChpbmRleCArIDEpICUgdGhpcy5fbGVuZ3RoO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUuaW5kZXggPSBpbmRleDtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLnggPSBpbmRleCAqIHRoaXMuY3VycmVudEZyYW1lLndpZHRoO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKGdhbWVUaW1lOiBEYXRlKTogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5jYW5BbmltYXRlKGdhbWVUaW1lKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0QW5pbWF0ZWQgPSBnYW1lVGltZTtcclxuXHJcblx0XHRcdHRoaXMubmV4dCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmVzZXQoKTogdm9pZCB7XHJcblx0XHR0aGlzLl9sYXN0QW5pbWF0ZWQgPSBuZXcgRGF0ZSgwKTtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLmluZGV4ID0gMDtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLnggPSAwO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi93b3JsZCc7XHJcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBub29wIH0gZnJvbSAnLi91dGlsJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCb2R5IHtcclxuXHRwb3NpdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xyXG5cdHZlbG9jaXR5OiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XHJcblx0b3ZlcmxhcDogVmVjdG9yID0gIG5ldyBWZWN0b3IoKTsgXHJcblx0c3BlZWQgOiBudW1iZXI7XHJcblx0d2lkdGggOiBudW1iZXI7XHJcblx0aGVpZ2h0IDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjogVmVjdG9yLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPOiBOZWVkcyB0byBiZSBpbXByb3ZlZCBiZWFjYXVzZSBtb3JlIEZQUyByZXN1bHRzIGluIGZhc3RlciBtb3ZlbWVudDtcclxuXHRwcml2YXRlIHVwZGF0ZU1vdmVtZW50KCk6dm9pZCB7XHJcblx0XHR0aGlzLnBvc2l0aW9uID0gVmVjdG9yLmFkZCh0aGlzLnBvc2l0aW9uLCB0aGlzLnZlbG9jaXR5KTtcclxuXHJcblx0XHR0aGlzLnNwZWVkID0gTWF0aC5oeXBvdCh0aGlzLnZlbG9jaXR5LngsIHRoaXMudmVsb2NpdHkueSk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSB7XHJcblx0XHR0aGlzLnVwZGF0ZU1vdmVtZW50KCk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1bGxldCBleHRlbmRzIEVudGl0eSB7XHJcblx0cHVibGljIHRhcmdldCA6IFBvaW50O1xyXG5cdHB1YmxpYyBwYXJlbnQgOiBFbnRpdHk7XHJcblx0cHVibGljIHNwZWVkIDogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIGRhbWFnZUFtb3VudCA6IG51bWJlciA9IDEwO1xyXG5cdHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoKSwgMywgMyk7XHJcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDEwLCAxMCkpO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9pbnQsIHRhcmdldDogUG9pbnQsIHBhcmVudCA6IEVudGl0eSkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLmJvZHkucG9zaXRpb24gPSBuZXcgVmVjdG9yKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xyXG5cdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuXHJcblx0XHR0aGlzLnNldFZlbG9jaXR5KHRoaXMudGFyZ2V0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0VmVsb2NpdHkocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xyXG4gICAgICAgIGxldCBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcbiAgICAgICAgbGV0IGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgbGV0IGRpclggPSBwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnggPiAwID8gMSA6IC0xO1xyXG4gICAgICAgIGxldCBkaXJZID0gcG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55ID4gMCA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgbGV0IHggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XHJcbiAgICAgICAgbGV0IHkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eSA9IG5ldyBWZWN0b3IoeCwgeSk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgUGh5c2ljcyB9IGZyb20gJy4vcGh5c2ljcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uTWFuYWdlciB7IFxyXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xyXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaCgoYnVsbGV0KSA9PiB7XHJcblx0XHRcdFx0UGh5c2ljcy5jb2xsaWRlKGVuZW15LmJvZHksIGJ1bGxldC5ib2R5LCAoKSA9PiB7XHJcblx0XHRcdFx0XHRlbmVteS5kYW1hZ2UoYnVsbGV0LmRhbWFnZUFtb3VudCwgYnVsbGV0LnBhcmVudCk7XHJcblxyXG5cdFx0XHRcdFx0YnVsbGV0LmtpbGwoKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl9nYW1lLnNjb3JlICs9IDEwO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdFBoeXNpY3MuY29sbGlkZShlbmVteS5ib2R5LCB0aGlzLl9nYW1lLnBsYXllci5ib2R5LCAoKSA9PiB7XHJcblx0XHRcdFx0ZW5lbXkuaGl0KHRoaXMuX2dhbWUucGxheWVyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLndhbGxzLmZvckVhY2godyA9PiB7XHJcblx0XHRcdFBoeXNpY3MuY29sbGlkZSh0aGlzLl9nYW1lLnBsYXllci5ib2R5LCB3LmJvZHksICgpID0+IHtcclxuXHRcdFx0XHQvL3RoaXMuX2dhbWUucGxheWVyLmJvZHkuaXNCbG9ja2VkID0gdHJ1ZTtcclxuXHRcdFx0XHRsZXQgb3ZlcmxhcCA9IFBoeXNpY3MuZ2V0T3ZlcmxhcCh0aGlzLl9nYW1lLnBsYXllci5ib2R5LCB3LmJvZHkpO1xyXG5cclxuXHRcdFx0XHRpZiAoTWF0aC5hYnMob3ZlcmxhcC54KSA8IE1hdGguYWJzKG92ZXJsYXAueSkpIHtcclxuXHRcdFx0XHRcdHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb24ueCArPSBvdmVybGFwLng7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb24ueSArPSBvdmVybGFwLnk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUud2FsbHMuZm9yRWFjaCh3ID0+IHtcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goYiA9PiB7XHJcblx0XHRcdFx0UGh5c2ljcy5jb2xsaWRlKHcuYm9keSwgYi5ib2R5LCAoKSA9PiB7XHJcblx0XHRcdFx0XHRiLmtpbGwoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KVxyXG5cdH1cclxufSIsImV4cG9ydCBjb25zdCBNU19JTl9TRUMgPSAxMDAwO1xyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBHZW5lcmljTWFwIGFzIE1hcCB9IGZyb20gJy4vY29sbGVjdGlvbnMnO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcblxyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuXHJcbmltcG9ydCAqIGFzIFJhbmRvbSBmcm9tICcuL3JhbmRvbSc7XHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBFbnRpdHkge1xyXG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcclxuXHRcdFx0J2lkbGUnIDogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRcdCdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHRcdFx0J2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9sYXN0SGl0OiBEYXRlID0gbmV3IERhdGUoMCk7XHJcbiAgICBwcml2YXRlIF9nYW1lOiBHYW1lO1xyXG5cclxuXHJcbiAgICBwdWJsaWMgY3VycmVudEFuaW1hdGlvbiA6IEFuaW1hdGlvbjtcclxuICAgIHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDIuNTtcclxuICAgIHB1YmxpYyBkYWdhbWVBbW91bnQ6IG51bWJlciA9IDU7XHJcbiAgICBwdWJsaWMgYXR0YWNrU3BlZWQ6IG51bWJlciA9IDI1MDtcclxuICAgIHB1YmxpYyB0YXJnZXQgOiBFbnRpdHk7XHJcbiAgICBwdWJsaWMgYm9keSA6IEJvZHk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSwgdGFyZ2V0OiBFbnRpdHkpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblxyXG4gICAgICAgIGxldCByYW5kb21YID0gUmFuZG9tLmdldFJhbmRvbUludCgwLCB0aGlzLl9nYW1lLmNhbnZhcy53aWR0aCk7XHJcbiAgICAgICAgbGV0IHJhbmRvbVkgPSBSYW5kb20uZ2V0UmFuZG9tSW50KDAsIHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IocmFuZG9tWCwgcmFuZG9tWSksIDM2LCAzNik7XHJcblxyXG5cdFx0dGhpcy5hbmltYXRlKCdyaWdodCcpO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb24gOiBzdHJpbmcpIDogdm9pZCB7XHJcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25zW2FuaW1hdGlvbl07XHJcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24uc3BlZWQgPSAxMDtcclxuXHR9XHJcblxyXG4gICAgLy8gVE9ETyA6IGludmVzdGlnYXRlIGlzc3VlIHdpdGggZGlhZ29uYWwgc3BlZWQuIH4yLjEyIHdoZW4gaXMgc3VwcG9zZWQgdG8gYmUgM1xyXG5cdG1vdmVUb3dhcmRzKHBvc2l0aW9uOiBQb2ludCkgOiB2b2lkIHtcclxuICAgICAgICBsZXQgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xyXG4gICAgICAgIGxldCBkeSA9IE1hdGguYWJzKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIGxldCBkaXJYID0gTWF0aC5zaWduKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcbiAgICAgICAgbGV0IGRpclkgPSBNYXRoLnNpZ24ocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XHJcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XHJcblxyXG4gICAgICAgIGlmIChkaXJYID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdsZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKCk7XHJcblx0fVxyXG5cclxuICAgIHByaXZhdGUgY2FuSGl0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0SGl0LmdldFRpbWUoKTtcclxuXHJcblx0XHRyZXR1cm4gZGlmZiA+IHRoaXMuYXR0YWNrU3BlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaGl0KHRhcmdldDogRW50aXR5KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuSGl0KCkpIHtcclxuICAgICAgICAgICAgdGFyZ2V0LmRhbWFnZSh0aGlzLmRhZ2FtZUFtb3VudCwgdGhpcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9sYXN0SGl0ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLm1vdmVUb3dhcmRzKHRoaXMudGFyZ2V0LmJvZHkucG9zaXRpb24pO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCdFbmVteSBzcGVlZDogJyArIHRoaXMuYm9keS5zcGVlZCk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5IHtcclxuXHRwcml2YXRlIF9oZWFsdGggOiBudW1iZXIgPSAxMDA7XHJcblx0cHJpdmF0ZSBfYWxpdmUgOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwcml2YXRlIF9hdHRhY2tlciA6IEVudGl0eTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5O1xyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cclxuXHRnZXQgaGVhbHRoKCkgOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2hlYWx0aDtcclxuXHR9XHJcblxyXG5cdGdldCBhbGl2ZSgpIDogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYWxpdmU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9zZXRIZWFsdGgobnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdGlmICh0aGlzLl9oZWFsdGggPiAwICYmIHRoaXMuX2FsaXZlKSB7XHJcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XHJcblx0XHRcdHRoaXMua2lsbCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0a2lsbCgpIHtcclxuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XHJcblx0XHR0aGlzLl9hbGl2ZSA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0ZGFtYWdlKGFtb3VudCA6IG51bWJlciwgYXR0YWNrZXI6IEVudGl0eSkgOiB2b2lkIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aCgtYW1vdW50KTtcclxuXHJcblx0XHR0aGlzLl9hdHRhY2tlciA9IGF0dGFja2VyO1xyXG5cdH1cclxuXHJcblx0aGVhbChhbW91bnQgOiBudW1iZXIpIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aChhbW91bnQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge31cclxufSIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZSB7XHJcblx0aW5kZXggOiBudW1iZXIgPSAwO1xyXG5cdHg6IG51bWJlciA9IDA7XHJcblx0eTogbnVtYmVyID0gMDtcclxuXHR3aWR0aDogbnVtYmVyID0gMDtcclxuXHRoZWlnaHQ6IG51bWJlciA9IDA7XHJcblx0bmFtZSA6IHN0cmluZztcclxuXHJcblx0c3RhdGljIGNyZWF0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBGcmFtZSB7XHJcblx0XHRsZXQgZnJhbWUgPSBuZXcgRnJhbWUoKTtcclxuXHJcblx0XHRmcmFtZS54ID0geDtcclxuXHRcdGZyYW1lLnkgPSB5O1xyXG5cdFx0ZnJhbWUud2lkdGggPSB3aWR0aDtcclxuXHRcdGZyYW1lLmhlaWdodCA9IGhlaWdodDtcclxuXHRcdGZyYW1lLm5hbWUgPSBuYW1lO1xyXG5cclxuXHRcdHJldHVybiBmcmFtZTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBDb2xsaXNpb25NYW5hZ2VyIH0gZnJvbSAnLi9jb2xsaXNpb24tbWFuYWdlcic7XHJcbmltcG9ydCB7IEVuZW15IH0gZnJvbSAnLi9lbmVteSc7XHJcbmltcG9ydCB7IFdhbGwgfSBmcm9tICcuL3dhbGwnO1xyXG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XHJcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJy4vcGxheWVyJztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyZXInO1xyXG5pbXBvcnQgeyBVcGRhdGVyIH0gZnJvbSAnLi91cGRhdGVyJzsgXHJcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XHJcblx0Y29udGFpbmVyIDogc3RyaW5nO1xyXG5cdHNob3dBQUJCIDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG5cdHB1YmxpYyBjb25maWcgOiBDb25maWc7XHJcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cdHB1YmxpYyBpc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XHJcblx0cHVibGljIGJ1bGxldHM6IEJ1bGxldFtdID0gW107XHJcblx0cHVibGljIGVuZW1pZXM6IEVuZW15W10gPSBbXTtcclxuXHRwdWJsaWMgd2FsbHM6IFdhbGxbXSA9IFtdO1xyXG5cclxuXHRwdWJsaWMgZ2FtZVRpbWU6IERhdGU7XHJcblx0cHVibGljIHNjb3JlOiBudW1iZXIgPSAwO1xyXG5cclxuXHRwdWJsaWMgbWFwOiBNYXA7XHJcblx0cHVibGljIGlucHV0OiBJbnB1dDtcclxuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xyXG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XHJcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XHJcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XHJcblx0cHVibGljIG1vdXNlOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG5cdC8qKlxyXG5cdCAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSB1bmlxdWUgSUQ7IHVzZWQgdG8gY2FuY2VsIFJBRi1sb29wXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRwcml2YXRlIF9yYWZJZCA6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcclxuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdFx0dGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29uZmlnLmNvbnRhaW5lcik7XHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHRcdHRoaXMucGxheWVyID0gbmV3IFBsYXllcih0aGlzKTtcclxuXHRcdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG5cdFx0dGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzKTtcclxuXHRcdHRoaXMudmlld3BvcnQgPSBuZXcgVmlld3BvcnQodGhpcyk7XHJcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHRoaXMpO1xyXG5cdFx0dGhpcy51cGRhdGVyID0gbmV3IFVwZGF0ZXIodGhpcyk7XHJcblx0XHR0aGlzLmNvbGxpc2lvbnMgPSBuZXcgQ29sbGlzaW9uTWFuYWdlcih0aGlzKTtcclxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7IHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCB0aGlzLnBsYXllcikpOyB9XHJcblxyXG5cdFx0dGhpcy53YWxscy5wdXNoKG5ldyBXYWxsKHsgeDogMzUwLCB5OiAyMCB9KSk7XHJcblx0fVxyXG5cclxuXHR0aWNrKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0cnVuKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcclxuXHRcdFx0dGhpcy50aWNrKCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdG9wKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubGV0IGdhbWUgPSBuZXcgR2FtZSh7XHJcblx0Y29udGFpbmVyOiAnLmdhbWUnLFxyXG5cdHNob3dBQUJCOiBmYWxzZVxyXG59KTtcclxuXHJcbmdhbWUucnVuKCk7IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuXHJcbmV4cG9ydCBlbnVtIEFjdGlvbiB7IFxyXG5cdFVwLCBcclxuXHREb3duLFxyXG5cdExlZnQsXHJcblx0UmlnaHQsXHJcblx0QXR0YWNrXHJcbn1cclxuXHJcbmVudW0gS2V5IHtcclxuXHRXID0gODcsXHJcblx0QSA9IDY1LFxyXG5cdFMgPSA4MyxcclxuXHREID0gNjgsXHJcblx0VXAgPSAzOCxcclxuXHREb3duID0gNDAsXHJcblx0TGVmdCA9IDM3LFxyXG5cdFJpZ2h0ID0gMzlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0IHtcclxuXHRwcml2YXRlIF9iaW5kaW5ncyA6IE1hcDxBY3Rpb24+ID0ge1xyXG5cdFx0W0tleS5XXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuQV0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuU10gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuRF0gOiBBY3Rpb24uUmlnaHQsXHJcblx0XHRbS2V5LlVwXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuRG93bl0gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuTGVmdF0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuUmlnaHRdIDogQWN0aW9uLlJpZ2h0XHJcblx0fTtcclxuXHJcblx0cHVibGljIGFjdGlvbnMgOiBNYXA8Ym9vbGVhbj4gPSB7fTtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9tb3VzZVBvczogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0YmluZChrZXk6IEtleSwgYWN0aW9uOiBBY3Rpb24pIHtcclxuXHRcdHRoaXMudW5iaW5kKGtleSk7XHJcblxyXG5cdFx0dGhpcy5fYmluZGluZ3Nba2V5XSA9IGFjdGlvbjtcclxuXHR9XHJcblxyXG5cdHVuYmluZChrZXk6IEtleSkge1xyXG5cdFx0aWYgKHRoaXMuX2JpbmRpbmdzW2tleV0pIHtcclxuXHRcdFx0ZGVsZXRlIHRoaXMuX2JpbmRpbmdzW2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7IFxyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IHRydWU7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5VXAoZTogS2V5Ym9hcmRFdmVudCkge1xyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XHJcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcclxuXHJcblx0XHR0aGlzLmdldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlVXAoZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gZmFsc2U7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIDogTmVlZHMgYmV0dGVyIGltcGxlbWVudGF0aW9uXHJcblx0cHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGU6IE1vdXNlRXZlbnQpIHsgXHJcblx0XHRsZXQgY2FudmFzT2Zmc2V0ID0gdGhpcy5fZ2FtZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XHJcblx0ICAgICAgeDogZS5jbGllbnRYIC0gY2FudmFzT2Zmc2V0LmxlZnQsXHJcblx0ICAgICAgeTogZS5jbGllbnRZIC0gY2FudmFzT2Zmc2V0LnRvcFxyXG5cdCAgICB9O1xyXG5cclxuXHQgICBcdHRoaXMuX2dhbWUubW91c2UgPSB7XHJcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXHJcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZXhwb3J0IGNsYXNzIE1hcCB7IFxyXG5cdHB1YmxpYyB3aWR0aCA6IG51bWJlciA9IDIwMDA7XHJcblx0cHVibGljIGhlaWdodCA6IG51bWJlciA9IDE1MDA7XHJcbn0iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XHJcblx0IC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHR3byByZWN0YW5ndWxhciBib2RpZXMgaW50ZXJzZWN0XHJcbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MSBGaXJzdCBib2R5IHdpdGgge3gseX0gcG9zaXRpb24gYW5kIHt3aWR0aCwgaGVpZ2h0fVxyXG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTIgU2Vjb25kIGJvZHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhleSBpbnRlcnNlY3QsIG90aGVyd2lzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhib2R5MTogQm9keSwgYm9keTI6IEJvZHkpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblggPSBib2R5MS5wb3NpdGlvbi54IDwgYm9keTIucG9zaXRpb24ueCArIGJvZHkyLndpZHRoIFxyXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblkgPSBib2R5MS5wb3NpdGlvbi55IDwgYm9keTIucG9zaXRpb24ueSArIGJvZHkyLmhlaWdodCBcclxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblggJiYgaW50ZXJzZWN0aW9uWTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY29sbGlkZShib2R5MTogQm9keSwgYm9keTI6IEJvZHksIGNvbGxpc2lvbkNhbGxiYWNrOiBGdW5jdGlvbikgOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcclxuICAgICAgICAgICAgY29sbGlzaW9uQ2FsbGJhY2soKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRPdmVybGFwKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSk6IFZlY3RvciB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhib2R5MSwgYm9keTIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVmVjdG9yLmZyb20oeyB4OiAwLCB5OiAwIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG92ZXJsYXBYMSA9IGJvZHkyLnBvc2l0aW9uLnggLSAoYm9keTEucG9zaXRpb24ueCArIGJvZHkxLndpZHRoKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcFgyID0gKGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCkgLSBib2R5MS5wb3NpdGlvbi54O1xyXG5cclxuICAgICAgICBsZXQgb3ZlcmxhcFkxID0gYm9keTIucG9zaXRpb24ueSAtIChib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0KTtcclxuICAgICAgICBsZXQgb3ZlcmxhcFkyID0gKGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQpIC0gYm9keTEucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgbGV0IG92ZXJsYXBYID0gTWF0aC5hYnMob3ZlcmxhcFgxKSA8IE1hdGguYWJzKG92ZXJsYXBYMikgPyBvdmVybGFwWDEgOiBvdmVybGFwWDI7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBZID0gTWF0aC5hYnMob3ZlcmxhcFkxKSA8IE1hdGguYWJzKG92ZXJsYXBZMikgPyBvdmVybGFwWTEgOiBvdmVybGFwWTI7XHJcblxyXG4gICAgICAgIHJldHVybiBWZWN0b3IuZnJvbSh7IHg6IG92ZXJsYXBYLCB5OiBvdmVybGFwWSB9KTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJy4vdXRpbCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigxMCwgMTApLCAzNiwgMzYpO1xyXG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMztcclxuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XHJcblxyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcclxuXHQgICAgJ2lkbGUnIDogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcclxuXHR9O1xyXG5cdHByaXZhdGUgX2J1bGxldE9mZnNldCA6IFBvaW50ID0geyB4OiAxMiwgeTogMTggfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xyXG5cdH1cclxuXHJcblx0c2hvb3QoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIHsgXHJcblx0XHRcdFx0eDogdGhpcy5ib2R5LnBvc2l0aW9uLnggKyB0aGlzLl9idWxsZXRPZmZzZXQueCwgXHJcblx0XHRcdFx0eTogdGhpcy5ib2R5LnBvc2l0aW9uLnkgKyB0aGlzLl9idWxsZXRPZmZzZXQueSBcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRTcGF3biwgdGhpcy5fZ2FtZS5tb3VzZSwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhblNob290KCkgOiBib29sZWFuIHtcclxuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb24gOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGF0ZU1vdmVtZW50KCkgOiB2b2lkIHtcclxuXHRcdGxldCBpbnB1dCA9IHRoaXMuX2dhbWUuaW5wdXQ7XHJcblxyXG5cdFx0bGV0IG1vdmluZ1ggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF07XHJcblx0XHRsZXQgbW92aW5nWSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5Eb3duXTtcclxuXHJcblx0XHRsZXQgc3BlZWQgPSBtb3ZpbmdYICYmIG1vdmluZ1kgPyBNYXRoLnNxcnQodGhpcy5zcGVlZCAqIHRoaXMuc3BlZWQgLyAyKSA6IHRoaXMuc3BlZWQ7XHJcblxyXG5cdFx0bGV0IGRpcmVjdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xyXG5cclxuXHRcdGRpcmVjdGlvbi54ID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0gID8gLTEgOiAxLFxyXG5cdFx0ZGlyZWN0aW9uLnkgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gPyAtMSA6IDFcclxuXHJcblx0XHRkaXJlY3Rpb24ueCA9IG1vdmluZ1ggPyBkaXJlY3Rpb24ueCA6IDA7XHJcblx0XHRkaXJlY3Rpb24ueSA9IG1vdmluZ1kgPyBkaXJlY3Rpb24ueSA6IDA7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIHNwZWVkO1xyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIHNwZWVkO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKCdQbGF5ZXIgc3BlZWQ6ICcgKyB0aGlzLmJvZHkuc3BlZWQpO1xyXG5cclxuXHRcdHRoaXMuYm9keS51cGRhdGUoKTtcclxuXHJcblx0XHRpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSkge1xyXG5cdCAgICAgICAgdGhpcy5zaG9vdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb24oKSB7XHJcblx0XHRsZXQgYW5pbWF0aW9uID0gdGhpcy5fZ2FtZS5tb3VzZS54ID4gdGhpcy5ib2R5LnBvc2l0aW9uLnggPyAncmlnaHQnIDogJ2xlZnQnO1xyXG5cclxuXHRcdHRoaXMuYW5pbWF0ZShhbmltYXRpb24pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmFsaXZlKSB7XHJcblx0XHRcdHRoaXMudXBhdGVNb3ZlbWVudCgpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbigpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJleHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcclxuXHR4IDogbnVtYmVyO1xyXG5cdHkgOiBudW1iZXI7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlY3QgeyBcclxuXHR4OiBudW1iZXI7XHJcblx0eTogbnVtYmVyO1xyXG5cdHdpZHRoOiBudW1iZXI7XHJcblx0aGVpZ2h0OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBWZWN0b3Ige1xyXG5cdHggOiBudW1iZXIgPSAwO1xyXG5cdHkgOiBudW1iZXIgPSAwO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwKSB7XHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQodmFsdWU6IG51bWJlciB8IFZlY3Rvcik6IHZvaWQge1xyXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0dGhpcy54ID0gdGhpcy55ID0gdmFsdWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnggPSB2YWx1ZS54O1xyXG5cdFx0XHR0aGlzLnkgPSB2YWx1ZS55O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGNsb25lKCk6IFZlY3RvciB7XHJcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih0aGlzLngsIHRoaXMueSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgbWFnbml0dWRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgYWRkKHZlYzE6IFZlY3RvciwgdmVjMjogVmVjdG9yKTogVmVjdG9yIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYzEueCArIHZlYzIueCwgdmVjMS55ICsgdmVjMi55KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBzdWJ0cmFjdCh2ZWMxOiBWZWN0b3IsIHZlYzI6IFZlY3Rvcik6IFZlY3RvciB7XHJcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih2ZWMxLnggLSB2ZWMyLngsIHZlYzEueSAtIHZlYzIueSk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbXVsdGlwbHkodmVjOiBWZWN0b3IsIHNjYWxhcjogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih2ZWMueCAqIHNjYWxhciwgdmVjLnkgKiBzY2FsYXIpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGZyb20ocG9pbnQ6IFBvaW50KSB7XHJcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcihwb2ludC54LCBwb2ludC55KTtcclxuXHR9XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxufSIsImltcG9ydCB7IEdhbWUsIENvbmZpZyB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVuZGVyZXIge1xyXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xyXG5cclxuXHRwcml2YXRlIF90aWxlID0ge1xyXG5cdFx0d2lkdGggOiAzMCxcclxuXHRcdGhlaWdodDogMzBcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHQgKlx0U3ByaXRlcyBJIHVzZSBmb3IgYSBkZXZlbG9wbWVudCB3ZXJlIGNyZWF0ZWQgYnkgQ29keSBTaGVwcCBmb3IgaGlzIGdhbWUgRGVudGFsIERlZmVuZGVyOiBTYWdhIG9mIHRoZSBDYW5keSBIb3JkZS5cclxuXHQgKlx0UGxlYXNlIGNoZWNrIGhpcyBnaXRodWIgcmVwbzogaHR0cHM6Ly9naXRodWIuY29tL2NzaGVwcC9jYW5keWphbS9cclxuXHQgKi9cclxuXHRwcml2YXRlIF9yZXNvdXJjZXMgPSB7XHJcblx0XHQncGxheWVyJyA6ICcuL2ltZy9wbGF5ZXIucG5nJyxcclxuXHRcdCdlbmVteScgOiAnLi9pbWcvZW5lbXkucG5nJyxcclxuXHRcdCdidWxsZXQnIDogJy4vaW1nL2J1bGxldC5wbmcnLFxyXG5cdFx0J3dhbGwnOiAnLi9pbWcvdHJlZS1yZWQtMS5wbmcnXHJcblxyXG5cdH1cclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJUaWxlKHBvczogUG9pbnQsIGNvbG9yOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5yZWN0KHBvcy54LCBwb3MueSwgdGhpcy5fdGlsZS53aWR0aCwgdGhpcy5fdGlsZS5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuZmlsbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVuZGVyVGlsZXMoKSA6IHZvaWQge1xyXG4gICAgICAgIGxldCBjb2xvcnMgPSBbJyM3ODVjOTgnLCAnIzY5NGY4OCddO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMuX2dhbWUubWFwLndpZHRoOyB4ICs9IHRoaXMuX3RpbGUud2lkdGgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQ7IHkgKz0gdGhpcy5fdGlsZS5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcclxuICAgICAgICAgICAgICAgIGxldCB5SW5kZXggPSAoeSAvIHRoaXMuX3RpbGUuaGVpZ2h0KSAlIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGVQb3MgPSB0aGlzLmNhbWVyYU9mZnNldCh7eCwgeX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlUG9zLCBjb2xvcnNbeEluZGV4IF4geUluZGV4XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW1lcmFPZmZzZXQocG9zOiBQb2ludCkgOiBQb2ludCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckhlbHBlcihzb3VyY2UgOiBzdHJpbmcsIGNvbGxlY3Rpb24gOiBFbnRpdHlbXSkge1xyXG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0aW1nLnNyYyA9IHNvdXJjZTtcclxuXHJcblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHtcclxuXHRcdFx0bGV0IGZyYW1lID0gZS5jdXJyZW50QW5pbWF0aW9uLmN1cnJlbnRGcmFtZTtcclxuXHRcdFx0bGV0IHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KGUuYm9keS5wb3NpdGlvbik7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fZ2FtZS5jb25maWcuc2hvd0FBQkIpIHtcclxuXHRcdFx0XHR0aGlzLnJlbmRlckFBQkIobmV3IEJvZHkobmV3IFZlY3Rvcihwb3MueCwgcG9zLnkpLCBlLmJvZHkud2lkdGgsIGUuYm9keS5oZWlnaHQpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmRyYXdJbWFnZShcclxuXHRcdFx0XHRpbWcsXHJcblx0XHRcdFx0ZnJhbWUueCwgZnJhbWUueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0LFxyXG5cdFx0XHRcdHBvcy54LCBwb3MueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyB0b2RvOiBleHRyYWN0IGhwLWJhciByZW5kZXJpbmcgbG9naWNcclxuXHRwcml2YXRlIHJlbmRlckh1ZCgpOiB2b2lkIHtcclxuXHRcdGxldCBvZmZzZXQgPSAyMDtcclxuXHJcblx0XHRsZXQgYmFyU2l6ZSA9IHsgd2lkdGg6IDE1MCwgaGVpZ2h0OiAxMCB9O1xyXG5cdFx0bGV0IGN0eCA9IHRoaXMuX2dhbWUuY29udGV4dDtcclxuXHJcblx0XHRjdHguYmVnaW5QYXRoKCk7XHJcblx0XHRjdHgucmVjdChcclxuXHRcdFx0b2Zmc2V0LFxyXG5cdFx0XHR0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQgLSBvZmZzZXQgKiAxLjIsXHJcblx0XHRcdGJhclNpemUud2lkdGgsXHJcblx0XHRcdGJhclNpemUuaGVpZ2h0XHJcblx0XHQpO1xyXG5cclxuXHJcblx0XHR2YXIgZ3JkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KG9mZnNldCwgdGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0LCBvZmZzZXQgKyBiYXJTaXplLndpZHRoLCB0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQgLSBvZmZzZXQgKyBiYXJTaXplLmhlaWdodCk7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDAsICcjNGNhZjUwJyk7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKHRoaXMuX2dhbWUucGxheWVyLmhlYWx0aCAvIDEwMCwgJyM0Y2FmNTAnKTtcclxuXHRcdGdyZC5hZGRDb2xvclN0b3AodGhpcy5fZ2FtZS5wbGF5ZXIuaGVhbHRoIC8gMTAwLCAnYmxhY2snKTtcclxuXHRcdGdyZC5hZGRDb2xvclN0b3AoMSwgJ2JsYWNrJyk7XHJcblxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGdyZDtcclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjMTgyNTI0JztcclxuXHRcdGN0eC5saW5lV2lkdGggPSAxO1xyXG5cdFx0Y3R4LmZpbGwoKTtcclxuXHRcdGN0eC5zdHJva2UoKTtcclxuXHJcblx0XHRjdHguZm9udCA9ICcyMHB4IENvbnNvbGFzJztcclxuICBcdFx0Y3R4LmZpbGxTdHlsZSA9ICcjZjZlODU1JztcclxuXHRcdGN0eC5maWxsVGV4dCh0aGlzLl9nYW1lLnNjb3JlLnRvU3RyaW5nKCksIG9mZnNldCwgdGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0ICogMS41KTtcclxuXHRcdFxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJBQUJCKGJvZHk6IEJvZHkpIHtcclxuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnRyYW5zbGF0ZSgwLjUsIDAuNSk7XHJcblx0XHRjdHgucmVjdChcclxuXHRcdFx0Ym9keS5wb3NpdGlvbi54LFxyXG5cdFx0XHRib2R5LnBvc2l0aW9uLnksXHJcblx0XHRcdGJvZHkud2lkdGgsXHJcblx0XHRcdGJvZHkuaGVpZ2h0XHJcblx0XHQpO1xyXG5cclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnO1xyXG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcblx0XHRjdHguc3Ryb2tlKCk7XHJcblx0XHRjdHgudHJhbnNsYXRlKC0wLjUsIC0wLjUpO1xyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuY2xlYXIoKTtcclxuXHJcblx0XHR0aGlzLnJlbmRlclRpbGVzKCk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2J1bGxldCddLCB0aGlzLl9nYW1lLmJ1bGxldHMpO1xyXG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydlbmVteSddLCB0aGlzLl9nYW1lLmVuZW1pZXMpO1xyXG5cclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1sncGxheWVyJ10sIFt0aGlzLl9nYW1lLnBsYXllcl0pO1xyXG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWyd3YWxsJ10sIHRoaXMuX2dhbWUud2FsbHMpO1xyXG5cdFx0dGhpcy5yZW5kZXJIdWQoKTtcclxuXHR9XHJcblxyXG5cdGNsZWFyKCkgOiB2b2lkIHtcclxuXHRcdGxldCB3ID0gdGhpcy5fZ2FtZS5jYW52YXMud2lkdGg7XHJcblx0XHRsZXQgaCA9IHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodDtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFVwZGF0ZXIge1xyXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhbGxFbnRpdGllcygpIDogRW50aXR5W10ge1xyXG5cdFx0cmV0dXJuIDxFbnRpdHlbXT4gQXJyYXkucHJvdG90eXBlLmNvbmNhdChcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLFxyXG5cdFx0XHR0aGlzLl9nYW1lLmVuZW1pZXMsXHJcblx0XHRcdHRoaXMuX2dhbWUucGxheWVyXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb25zKCkgOiB2b2lkIHtcclxuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcclxuXHJcblx0XHRlbnRpdGllcy5mb3JFYWNoKChlKT0+IHsgZS5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZSh0aGlzLl9nYW1lLmdhbWVUaW1lKTsgfSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZUVudGl0aWVzKCkgOiB2b2lkIHtcclxuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcclxuXHJcblx0XHRlbnRpdGllcy5mb3JFYWNoKGUgPT4geyBlLnVwZGF0ZSgpOyB9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlRGVhZCgpIDogdm9pZCB7XHJcblx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuYnVsbGV0cyk7IH0pXHJcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuZW5lbWllcyk7IH0pXHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbW92ZURlYWQoZTogRW50aXR5LCBjb2xsZWN0aW9uOiBFbnRpdHlbXSkge1xyXG5cdFx0aWYgKGUuYWxpdmUgPT09IGZhbHNlKSB7XHJcblx0XHRcdGxldCBlSW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoZSk7XHJcblxyXG5cdFx0XHRpZiAoZUluZGV4ID4gLTEpIHtcclxuXHRcdFx0XHRjb2xsZWN0aW9uLnNwbGljZShlSW5kZXgsIDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy51cGRhdGVBbmltYXRpb25zKCk7XHJcblx0XHR0aGlzLnVwZGF0ZUVudGl0aWVzKCk7XHJcblx0XHR0aGlzLnVwZGF0ZURlYWQoKTtcclxuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudGFyZ2V0ID0gdGhpcy5fZ2FtZS5wbGF5ZXIuYm9keS5wb3NpdGlvbjtcclxuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudXBkYXRlKCk7XHJcblx0XHR0aGlzLl9nYW1lLmNvbGxpc2lvbnMudXBkYXRlKCk7XHJcblx0XHR0aGlzLl9nYW1lLmlucHV0LnVwZGF0ZSgpO1xyXG5cdH1cclxufSIsImltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge307XHJcblxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcblx0c3RhdGljIGNsYW1wKHZhbHVlIDogbnVtYmVyLCBtaW4gOiBudW1iZXIsIG1heCA6IG51bWJlcikgOiBudW1iZXIge1xyXG5cdFx0aWYgKHZhbHVlID4gbWF4KSB7IHJldHVybiBtYXg7IH1cclxuXHRcdGlmICh2YWx1ZSA8IG1pbikgeyByZXR1cm4gbWluOyB9XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcclxuXHRwdWJsaWMgdGFyZ2V0OiBQb2ludDtcclxuXHRwdWJsaWMgcG9zaXRpb246IFBvaW50ID0geyB4IDogMCwgeSA6IDAgfTtcclxuXHJcblx0cHJpdmF0ZSBfZ2FtZTogR2FtZTtcclxuXHRwcml2YXRlIF93aWR0aDogbnVtYmVyO1xyXG5cdHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0XHR0aGlzLl93aWR0aCA9IGdhbWVJbnN0YW5jZS5jYW52YXMud2lkdGg7XHJcblx0XHR0aGlzLl9oZWlnaHQgPSBnYW1lSW5zdGFuY2UuY2FudmFzLmhlaWdodDtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgY2FsY3VsYXRlUG9zaXRpb24oKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC54IC0gdGhpcy5fd2lkdGggLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC53aWR0aCAtIHRoaXMuX3dpZHRoKTtcclxuXHRcdHRoaXMucG9zaXRpb24ueSA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueSAtIHRoaXMuX2hlaWdodCAvIDIsIDAsIHRoaXMuX2dhbWUubWFwLmhlaWdodCAtIHRoaXMuX2hlaWdodCk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jYWxjdWxhdGVQb3NpdGlvbigpO1xyXG5cdH1cclxufSIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgV2FsbCBleHRlbmRzIEVudGl0eSB7XHJcbiAgICBwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKCksIDE1MSwgMjExKTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTUxLCAyMTEpKTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9pbnQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuYm9keS5wb3NpdGlvbiA9IFZlY3Rvci5mcm9tKHBvc2l0aW9uKTtcclxuICAgIH1cclxufSJdfQ==
