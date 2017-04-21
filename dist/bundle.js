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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JlbmRlcmVyLnRzIiwic3JjL2pzL3VwZGF0ZXIudHMiLCJzcmMvanMvdXRpbC50cyIsInNyYy9qcy92aWV3cG9ydC50cyIsInNyYy9qcy93YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0NBLE1BQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBRWpDO0lBbUJDLFlBQVksTUFBYyxFQUFFLEdBQVcsRUFBRSxLQUFZO1FBWjlDLFVBQUssR0FBWSxDQUFDLENBQUM7UUFNbkIsU0FBSSxHQUFZLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDNUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFXO1FBQ3JCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFP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QUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFLcEYsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZTtRQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzdDLElBQUks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QixPQUFPLENBQUM7UUFKTCxTQUFJLEdBQVUsSUFBSSxXQUFJLENBQUMsSUFBSSxtQkFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELHFCQUFnQixHQUFjLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUloRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0FBQ0wsQ0FBQztBQVJZLFlBQUksT0FRaEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgKiBhcyBDb25zdCBmcm9tICcuL2NvbnN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xyXG5cdHB1YmxpYyBjdXJyZW50RnJhbWUgOiBGcmFtZTtcclxuXHJcblx0LyoqXHJcblx0ICogTnVtYmVyIG9mIGZyYW1lcyBwZXIgc2Vjb25kXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAwO1xyXG5cdC8qKlxyXG5cdCAqIFRPRE86IEltcGxlbWVudCwgZmllbGQgaXMgbm90IHVzZWQgXHJcblx0ICogU2V0IHRvIHRydWUgdG8gbWFrZSBhbmltYXRpb24gbG9vcGVkLCBmYWxzZSAtIGZvciBvbmUgY3ljbGUgb25seVxyXG5cdCAqIEB0eXBlIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsb29wOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcblx0cHJpdmF0ZSBfbGFzdEFuaW1hdGVkIDogRGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cdHByaXZhdGUgX3JvdyA6IG51bWJlcjtcclxuXHRwcml2YXRlIF9sZW5ndGggOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGxlbmd0aDogbnVtYmVyLCByb3c6IG51bWJlciwgZnJhbWU6IEZyYW1lKSB7XHJcblx0XHR0aGlzLl9yb3cgPSByb3c7XHJcblx0XHR0aGlzLl9sZW5ndGggPSBsZW5ndGg7XHJcblxyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLnkgPSB0aGlzLl9yb3cgKiB0aGlzLmN1cnJlbnRGcmFtZS5oZWlnaHQ7XHJcblx0fVxyXG5cclxuXHRjYW5BbmltYXRlKHRpbWUgOiBEYXRlKSA6IGJvb2xlYW4ge1xyXG5cdFx0bGV0IGFuaW1hdGlvbkRlbHRhID0gdGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0QW5pbWF0ZWQuZ2V0VGltZSgpO1xyXG5cclxuXHRcdHJldHVybiBhbmltYXRpb25EZWx0YSA+IHRoaXMuZGVsYXk7XHJcblx0fVxyXG5cclxuXHRnZXQgZGVsYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBDb25zdC5NU19JTl9TRUMgLyB0aGlzLnNwZWVkO1xyXG5cdH1cclxuXHJcblx0bmV4dCgpOiB2b2lkIHtcclxuXHRcdGxldCBpbmRleCA9IHRoaXMuY3VycmVudEZyYW1lLmluZGV4O1xyXG5cclxuXHRcdGluZGV4ID0gKGluZGV4ICsgMSkgJSB0aGlzLl9sZW5ndGg7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5pbmRleCA9IGluZGV4O1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IGluZGV4ICogdGhpcy5jdXJyZW50RnJhbWUud2lkdGg7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoZ2FtZVRpbWU6IERhdGUpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmNhbkFuaW1hdGUoZ2FtZVRpbWUpKSB7XHJcblx0XHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IGdhbWVUaW1lO1xyXG5cclxuXHRcdFx0dGhpcy5uZXh0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IG5ldyBEYXRlKDApO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUuaW5kZXggPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IDA7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL3dvcmxkJztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvZHkge1xyXG5cdHBvc2l0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XHJcblx0dmVsb2NpdHk6IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcclxuXHRvdmVybGFwOiBWZWN0b3IgPSAgbmV3IFZlY3RvcigpOyBcclxuXHRzcGVlZCA6IG51bWJlcjtcclxuXHR3aWR0aCA6IG51bWJlcjtcclxuXHRoZWlnaHQgOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE86IE5lZWRzIHRvIGJlIGltcHJvdmVkIGJlYWNhdXNlIG1vcmUgRlBTIHJlc3VsdHMgaW4gZmFzdGVyIG1vdmVtZW50O1xyXG5cdHByaXZhdGUgdXBkYXRlTW92ZW1lbnQoKTp2b2lkIHtcclxuXHRcdHRoaXMucG9zaXRpb24gPSBWZWN0b3IuYWRkKHRoaXMucG9zaXRpb24sIHRoaXMudmVsb2NpdHkpO1xyXG5cclxuXHRcdHRoaXMuc3BlZWQgPSBNYXRoLmh5cG90KHRoaXMudmVsb2NpdHkueCwgdGhpcy52ZWxvY2l0eS55KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdHRoaXMudXBkYXRlTW92ZW1lbnQoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVsbGV0IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwdWJsaWMgdGFyZ2V0IDogUG9pbnQ7XHJcblx0cHVibGljIHBhcmVudCA6IEVudGl0eTtcclxuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAxMDtcclxuXHRwdWJsaWMgZGFtYWdlQW1vdW50IDogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigpLCAzLCAzKTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTAsIDEwKSk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCwgdGFyZ2V0OiBQb2ludCwgcGFyZW50IDogRW50aXR5KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuYm9keS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG5cclxuXHRcdHRoaXMuc2V0VmVsb2NpdHkodGhpcy50YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRWZWxvY2l0eShwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgbGV0IGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xyXG5cclxuICAgICAgICBsZXQgeCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcclxuICAgICAgICBsZXQgeSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih4LCB5KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLmJvZHkudXBkYXRlKCk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBQaHlzaWNzIH0gZnJvbSAnLi9waHlzaWNzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25NYW5hZ2VyIHsgXHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKChidWxsZXQpID0+IHtcclxuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUoZW5lbXkuYm9keSwgYnVsbGV0LmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRcdGVuZW15LmRhbWFnZShidWxsZXQuZGFtYWdlQW1vdW50LCBidWxsZXQucGFyZW50KTtcclxuXHJcblx0XHRcdFx0XHRidWxsZXQua2lsbCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdFBoeXNpY3MuY29sbGlkZShlbmVteS5ib2R5LCB0aGlzLl9nYW1lLnBsYXllci5ib2R5LCAoKSA9PiB7XHJcblx0XHRcdFx0ZW5lbXkuaGl0KHRoaXMuX2dhbWUucGxheWVyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLndhbGxzLmZvckVhY2godyA9PiB7XHJcblx0XHRcdFBoeXNpY3MuY29sbGlkZSh0aGlzLl9nYW1lLnBsYXllci5ib2R5LCB3LmJvZHksICgpID0+IHtcclxuXHRcdFx0XHQvL3RoaXMuX2dhbWUucGxheWVyLmJvZHkuaXNCbG9ja2VkID0gdHJ1ZTtcclxuXHRcdFx0XHRsZXQgb3ZlcmxhcCA9IFBoeXNpY3MuZ2V0T3ZlcmxhcCh0aGlzLl9nYW1lLnBsYXllci5ib2R5LCB3LmJvZHkpO1xyXG5cclxuXHRcdFx0XHRpZiAoTWF0aC5hYnMob3ZlcmxhcC54KSA8IE1hdGguYWJzKG92ZXJsYXAueSkpIHtcclxuXHRcdFx0XHRcdHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb24ueCArPSBvdmVybGFwLng7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb24ueSArPSBvdmVybGFwLnk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUud2FsbHMuZm9yRWFjaCh3ID0+IHtcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goYiA9PiB7XHJcblx0XHRcdFx0UGh5c2ljcy5jb2xsaWRlKHcuYm9keSwgYi5ib2R5LCAoKSA9PiB7XHJcblx0XHRcdFx0XHRiLmtpbGwoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KVxyXG5cdH1cclxufSIsImV4cG9ydCBjb25zdCBNU19JTl9TRUMgPSAxMDAwO1xyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBHZW5lcmljTWFwIGFzIE1hcCB9IGZyb20gJy4vY29sbGVjdGlvbnMnO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcblxyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFbmVteSBleHRlbmRzIEVudGl0eSB7XHJcblx0cHJpdmF0ZSBfYW5pbWF0aW9ucyA6IE1hcDxBbmltYXRpb24+ID0ge1xyXG5cdFx0XHQnaWRsZScgOiBuZXcgQW5pbWF0aW9uKDEsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHRcdFx0J3JpZ2h0JyA6IG5ldyBBbmltYXRpb24oNCwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxyXG5cdFx0XHQnbGVmdCcgOiBuZXcgQW5pbWF0aW9uKDQsIDEsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKVxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX2xhc3RIaXQ6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuICAgIHByaXZhdGUgX2dhbWU6IEdhbWU7XHJcblxyXG5cclxuICAgIHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG4gICAgcHVibGljIHNwZWVkIDogbnVtYmVyID0gMztcclxuICAgIHB1YmxpYyBkYWdhbWVBbW91bnQ6IG51bWJlciA9IDU7XHJcbiAgICBwdWJsaWMgYXR0YWNrU3BlZWQ6IG51bWJlciA9IDI1MDtcclxuICAgIHB1YmxpYyB0YXJnZXQgOiBFbnRpdHk7XHJcbiAgICBwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKDEwMCwgMTAwKSwgMzYsIDM2KTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lLCB0YXJnZXQ6IEVudGl0eSkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHJcblx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XHJcblx0fVxyXG5cclxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZykgOiB2b2lkIHtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xyXG5cdH1cclxuXHJcbiAgICAvLyBUT0RPIDogaW52ZXN0aWdhdGUgaXNzdWUgd2l0aCBkaWFnb25hbCBzcGVlZC4gfjIuMTIgd2hlbiBpcyBzdXBwb3NlZCB0byBiZSAzXHJcblx0bW92ZVRvd2FyZHMocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xyXG4gICAgICAgIGxldCBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcbiAgICAgICAgbGV0IGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgbGV0IGRpclggPSBNYXRoLnNpZ24ocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICBsZXQgZGlyWSA9IE1hdGguc2lnbihwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcclxuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcclxuXHJcbiAgICAgICAgaWYgKGRpclggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgncmlnaHQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoJ2xlZnQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS51cGRhdGUoKTtcclxuXHR9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW5IaXQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGRpZmYgPSB0aGlzLl9nYW1lLmdhbWVUaW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RIaXQuZ2V0VGltZSgpO1xyXG5cclxuXHRcdHJldHVybiBkaWZmID4gdGhpcy5hdHRhY2tTcGVlZDtcclxuICAgIH1cclxuXHJcbiAgICBoaXQodGFyZ2V0OiBFbnRpdHkpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5IaXQoKSkge1xyXG4gICAgICAgICAgICB0YXJnZXQuZGFtYWdlKHRoaXMuZGFnYW1lQW1vdW50LCB0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2xhc3RIaXQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMubW92ZVRvd2FyZHModGhpcy50YXJnZXQuYm9keS5wb3NpdGlvbik7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJFbmVteSBzcGVlZDogXCIgKyB0aGlzLmJvZHkuc3BlZWQpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVudGl0eSB7XHJcblx0cHJpdmF0ZSBfaGVhbHRoIDogbnVtYmVyID0gMTAwO1xyXG5cdHByaXZhdGUgX2FsaXZlIDogYm9vbGVhbiA9IHRydWU7XHJcblx0cHJpdmF0ZSBfYXR0YWNrZXIgOiBFbnRpdHk7XHJcblxyXG5cdHB1YmxpYyBib2R5IDogQm9keTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbiA6IEFuaW1hdGlvbjtcclxuXHJcblx0Z2V0IGhlYWx0aCgpIDogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9oZWFsdGg7XHJcblx0fVxyXG5cclxuXHRnZXQgYWxpdmUoKSA6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2FsaXZlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfc2V0SGVhbHRoKG51bWJlcjogbnVtYmVyKSB7XHJcblx0XHRpZiAodGhpcy5faGVhbHRoID4gMCAmJiB0aGlzLl9hbGl2ZSkge1xyXG5cdFx0XHR0aGlzLl9oZWFsdGggKz0gbnVtYmVyO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9oZWFsdGggPD0gMCkge1xyXG5cdFx0XHR0aGlzLmtpbGwoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGtpbGwoKSB7XHJcblx0XHR0aGlzLl9oZWFsdGggPSAwO1xyXG5cdFx0dGhpcy5fYWxpdmUgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGRhbWFnZShhbW91bnQgOiBudW1iZXIsIGF0dGFja2VyOiBFbnRpdHkpIDogdm9pZCB7XHJcblx0XHR0aGlzLl9zZXRIZWFsdGgoLWFtb3VudCk7XHJcblxyXG5cdFx0dGhpcy5fYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuXHR9XHJcblxyXG5cdGhlYWwoYW1vdW50IDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLl9zZXRIZWFsdGgoYW1vdW50KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHt9XHJcbn0iLCJpbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgRnJhbWUge1xyXG5cdGluZGV4IDogbnVtYmVyID0gMDtcclxuXHR4OiBudW1iZXIgPSAwO1xyXG5cdHk6IG51bWJlciA9IDA7XHJcblx0d2lkdGg6IG51bWJlciA9IDA7XHJcblx0aGVpZ2h0OiBudW1iZXIgPSAwO1xyXG5cdG5hbWUgOiBzdHJpbmc7XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWUge1xyXG5cdFx0bGV0IGZyYW1lID0gbmV3IEZyYW1lKCk7XHJcblxyXG5cdFx0ZnJhbWUueCA9IHg7XHJcblx0XHRmcmFtZS55ID0geTtcclxuXHRcdGZyYW1lLndpZHRoID0gd2lkdGg7XHJcblx0XHRmcmFtZS5oZWlnaHQgPSBoZWlnaHQ7XHJcblx0XHRmcmFtZS5uYW1lID0gbmFtZTtcclxuXHJcblx0XHRyZXR1cm4gZnJhbWU7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEJ1bGxldCB9IGZyb20gJy4vYnVsbGV0JztcclxuaW1wb3J0IHsgQ29sbGlzaW9uTWFuYWdlciB9IGZyb20gJy4vY29sbGlzaW9uLW1hbmFnZXInO1xyXG5pbXBvcnQgeyBFbmVteSB9IGZyb20gJy4vZW5lbXknO1xyXG5pbXBvcnQgeyBXYWxsIH0gZnJvbSAnLi93YWxsJztcclxuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuL2lucHV0JztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL3JlbmRlcmVyJztcclxuaW1wb3J0IHsgVXBkYXRlciB9IGZyb20gJy4vdXBkYXRlcic7IFxyXG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gJy4vdmlld3BvcnQnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xyXG5cdGNvbnRhaW5lciA6IHN0cmluZztcclxuXHRzaG93QUFCQiA6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lIHtcclxuXHRwdWJsaWMgY29uZmlnIDogQ29uZmlnO1xyXG5cdHB1YmxpYyBjYW52YXMgOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuXHRwdWJsaWMgY29udGV4dCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuXHRwdWJsaWMgaXNSdW5uaW5nID0gZmFsc2U7XHJcblx0cHVibGljIHBsYXllcjogUGxheWVyO1xyXG5cdHB1YmxpYyBidWxsZXRzOiBCdWxsZXRbXSA9IFtdO1xyXG5cdHB1YmxpYyBlbmVtaWVzOiBFbmVteVtdID0gW107XHJcblx0cHVibGljIHdhbGxzOiBXYWxsW10gPSBbXTtcclxuXHJcblx0cHVibGljIGdhbWVUaW1lOiBEYXRlO1xyXG5cclxuXHRwdWJsaWMgbWFwOiBNYXA7XHJcblx0cHVibGljIGlucHV0OiBJbnB1dDtcclxuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xyXG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XHJcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XHJcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XHJcblx0cHVibGljIG1vdXNlOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG5cdC8qKlxyXG5cdCAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSB1bmlxdWUgSUQ7IHVzZWQgdG8gY2FuY2VsIFJBRi1sb29wXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRwcml2YXRlIF9yYWZJZCA6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcclxuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdFx0dGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29uZmlnLmNvbnRhaW5lcik7XHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHRcdHRoaXMucGxheWVyID0gbmV3IFBsYXllcih0aGlzKTtcclxuXHRcdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG5cdFx0dGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzKTtcclxuXHRcdHRoaXMudmlld3BvcnQgPSBuZXcgVmlld3BvcnQodGhpcyk7XHJcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHRoaXMpO1xyXG5cdFx0dGhpcy51cGRhdGVyID0gbmV3IFVwZGF0ZXIodGhpcyk7XHJcblx0XHR0aGlzLmNvbGxpc2lvbnMgPSBuZXcgQ29sbGlzaW9uTWFuYWdlcih0aGlzKTtcclxuXHRcdHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCB0aGlzLnBsYXllcikpO1xyXG5cdFx0dGhpcy53YWxscy5wdXNoKG5ldyBXYWxsKHsgeDogMzUwLCB5OiAyMCB9KSk7XHJcblx0fVxyXG5cclxuXHR0aWNrKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0cnVuKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcclxuXHRcdFx0dGhpcy50aWNrKCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdG9wKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubGV0IGdhbWUgPSBuZXcgR2FtZSh7XHJcblx0Y29udGFpbmVyOiAnLmdhbWUnLFxyXG5cdHNob3dBQUJCOiBmYWxzZVxyXG59KTtcclxuXHJcbmdhbWUucnVuKCk7IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuXHJcbmV4cG9ydCBlbnVtIEFjdGlvbiB7IFxyXG5cdFVwLCBcclxuXHREb3duLFxyXG5cdExlZnQsXHJcblx0UmlnaHQsXHJcblx0QXR0YWNrXHJcbn1cclxuXHJcbmVudW0gS2V5IHtcclxuXHRXID0gODcsXHJcblx0QSA9IDY1LFxyXG5cdFMgPSA4MyxcclxuXHREID0gNjgsXHJcblx0VXAgPSAzOCxcclxuXHREb3duID0gNDAsXHJcblx0TGVmdCA9IDM3LFxyXG5cdFJpZ2h0ID0gMzlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0IHtcclxuXHRwcml2YXRlIF9iaW5kaW5ncyA6IE1hcDxBY3Rpb24+ID0ge1xyXG5cdFx0W0tleS5XXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuQV0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuU10gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuRF0gOiBBY3Rpb24uUmlnaHQsXHJcblx0XHRbS2V5LlVwXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuRG93bl0gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuTGVmdF0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuUmlnaHRdIDogQWN0aW9uLlJpZ2h0XHJcblx0fTtcclxuXHJcblx0cHVibGljIGFjdGlvbnMgOiBNYXA8Ym9vbGVhbj4gPSB7fTtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9tb3VzZVBvczogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0YmluZChrZXk6IEtleSwgYWN0aW9uOiBBY3Rpb24pIHtcclxuXHRcdHRoaXMudW5iaW5kKGtleSk7XHJcblxyXG5cdFx0dGhpcy5fYmluZGluZ3Nba2V5XSA9IGFjdGlvbjtcclxuXHR9XHJcblxyXG5cdHVuYmluZChrZXk6IEtleSkge1xyXG5cdFx0aWYgKHRoaXMuX2JpbmRpbmdzW2tleV0pIHtcclxuXHRcdFx0ZGVsZXRlIHRoaXMuX2JpbmRpbmdzW2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7IFxyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IHRydWU7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5VXAoZTogS2V5Ym9hcmRFdmVudCkge1xyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XHJcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcclxuXHJcblx0XHR0aGlzLmdldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlVXAoZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gZmFsc2U7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIDogTmVlZHMgYmV0dGVyIGltcGxlbWVudGF0aW9uXHJcblx0cHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGU6IE1vdXNlRXZlbnQpIHsgXHJcblx0XHRsZXQgY2FudmFzT2Zmc2V0ID0gdGhpcy5fZ2FtZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XHJcblx0ICAgICAgeDogZS5jbGllbnRYIC0gY2FudmFzT2Zmc2V0LmxlZnQsXHJcblx0ICAgICAgeTogZS5jbGllbnRZIC0gY2FudmFzT2Zmc2V0LnRvcFxyXG5cdCAgICB9O1xyXG5cclxuXHQgICBcdHRoaXMuX2dhbWUubW91c2UgPSB7XHJcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXHJcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZXhwb3J0IGNsYXNzIE1hcCB7IFxyXG5cdHB1YmxpYyB3aWR0aCA6IG51bWJlciA9IDIwMDA7XHJcblx0cHVibGljIGhlaWdodCA6IG51bWJlciA9IDE1MDA7XHJcbn0iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XHJcblx0IC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHR3byByZWN0YW5ndWxhciBib2RpZXMgaW50ZXJzZWN0XHJcbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MSBGaXJzdCBib2R5IHdpdGgge3gseX0gcG9zaXRpb24gYW5kIHt3aWR0aCwgaGVpZ2h0fVxyXG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTIgU2Vjb25kIGJvZHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhleSBpbnRlcnNlY3QsIG90aGVyd2lzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhib2R5MTogQm9keSwgYm9keTI6IEJvZHkpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblggPSBib2R5MS5wb3NpdGlvbi54IDwgYm9keTIucG9zaXRpb24ueCArIGJvZHkyLndpZHRoIFxyXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblkgPSBib2R5MS5wb3NpdGlvbi55IDwgYm9keTIucG9zaXRpb24ueSArIGJvZHkyLmhlaWdodCBcclxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblggJiYgaW50ZXJzZWN0aW9uWTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY29sbGlkZShib2R5MTogQm9keSwgYm9keTI6IEJvZHksIGNvbGxpc2lvbkNhbGxiYWNrOiBGdW5jdGlvbikgOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcclxuICAgICAgICAgICAgY29sbGlzaW9uQ2FsbGJhY2soKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRPdmVybGFwKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSk6IFZlY3RvciB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhib2R5MSwgYm9keTIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVmVjdG9yLmZyb20oeyB4OiAwLCB5OiAwIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG92ZXJsYXBYMSA9IGJvZHkyLnBvc2l0aW9uLnggLSAoYm9keTEucG9zaXRpb24ueCArIGJvZHkxLndpZHRoKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcFgyID0gKGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCkgLSBib2R5MS5wb3NpdGlvbi54O1xyXG5cclxuICAgICAgICBsZXQgb3ZlcmxhcFkxID0gYm9keTIucG9zaXRpb24ueSAtIChib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0KTtcclxuICAgICAgICBsZXQgb3ZlcmxhcFkyID0gKGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQpIC0gYm9keTEucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgbGV0IG92ZXJsYXBYID0gTWF0aC5hYnMob3ZlcmxhcFgxKSA8IE1hdGguYWJzKG92ZXJsYXBYMikgPyBvdmVybGFwWDEgOiBvdmVybGFwWDI7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBZID0gTWF0aC5hYnMob3ZlcmxhcFkxKSA8IE1hdGguYWJzKG92ZXJsYXBZMikgPyBvdmVybGFwWTEgOiBvdmVybGFwWTI7XHJcblxyXG4gICAgICAgIHJldHVybiBWZWN0b3IuZnJvbSh7IHg6IG92ZXJsYXBYLCB5OiBvdmVybGFwWSB9KTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJy4vdXRpbCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigxMCwgMTApLCAzNiwgMzYpO1xyXG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMztcclxuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XHJcblxyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcclxuXHQgICAgJ2lkbGUnIDogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcclxuXHR9O1xyXG5cdHByaXZhdGUgX2J1bGxldE9mZnNldCA6IFBvaW50ID0geyB4OiAxMiwgeTogMTggfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xyXG5cdH1cclxuXHJcblx0c2hvb3QoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIHsgXHJcblx0XHRcdFx0eDogdGhpcy5ib2R5LnBvc2l0aW9uLnggKyB0aGlzLl9idWxsZXRPZmZzZXQueCwgXHJcblx0XHRcdFx0eTogdGhpcy5ib2R5LnBvc2l0aW9uLnkgKyB0aGlzLl9idWxsZXRPZmZzZXQueSBcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRTcGF3biwgdGhpcy5fZ2FtZS5tb3VzZSwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhblNob290KCkgOiBib29sZWFuIHtcclxuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb24gOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGF0ZU1vdmVtZW50KCkgOiB2b2lkIHtcclxuXHRcdGxldCBpbnB1dCA9IHRoaXMuX2dhbWUuaW5wdXQ7XHJcblxyXG5cdFx0bGV0IG1vdmluZ1ggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF07XHJcblx0XHRsZXQgbW92aW5nWSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5Eb3duXTtcclxuXHJcblx0XHRsZXQgc3BlZWQgPSBtb3ZpbmdYICYmIG1vdmluZ1kgPyBNYXRoLnNxcnQodGhpcy5zcGVlZCAqIHRoaXMuc3BlZWQgLyAyKSA6IHRoaXMuc3BlZWQ7XHJcblxyXG5cdFx0bGV0IGRpcmVjdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xyXG5cclxuXHRcdGRpcmVjdGlvbi54ID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0gID8gLTEgOiAxLFxyXG5cdFx0ZGlyZWN0aW9uLnkgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gPyAtMSA6IDFcclxuXHJcblx0XHRkaXJlY3Rpb24ueCA9IG1vdmluZ1ggPyBkaXJlY3Rpb24ueCA6IDA7XHJcblx0XHRkaXJlY3Rpb24ueSA9IG1vdmluZ1kgPyBkaXJlY3Rpb24ueSA6IDA7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIHNwZWVkO1xyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIHNwZWVkO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKFwiUGxheWVyIHNwZWVkOiBcIiArIHRoaXMuYm9keS5zcGVlZCk7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cclxuXHRcdGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdKSB7XHJcblx0ICAgICAgICB0aGlzLnNob290KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZUFuaW1hdGlvbigpIHtcclxuXHRcdGxldCBhbmltYXRpb24gPSB0aGlzLl9nYW1lLm1vdXNlLnggPiB0aGlzLmJvZHkucG9zaXRpb24ueCA/ICdyaWdodCcgOiAnbGVmdCc7XHJcblxyXG5cdFx0dGhpcy5hbmltYXRlKGFuaW1hdGlvbik7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuYWxpdmUpIHtcclxuXHRcdFx0dGhpcy51cGF0ZU1vdmVtZW50KCk7XHJcblx0XHRcdHRoaXMudXBkYXRlQW5pbWF0aW9uKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsImV4cG9ydCBpbnRlcmZhY2UgUG9pbnQge1xyXG5cdHggOiBudW1iZXI7XHJcblx0eSA6IG51bWJlcjtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7IFxyXG5cdHg6IG51bWJlcjtcclxuXHR5OiBudW1iZXI7XHJcblx0d2lkdGg6IG51bWJlcjtcclxuXHRoZWlnaHQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZlY3RvciB7XHJcblx0eCA6IG51bWJlciA9IDA7XHJcblx0eSA6IG51bWJlciA9IDA7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHtcclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCh2YWx1ZTogbnVtYmVyIHwgVmVjdG9yKTogdm9pZCB7XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdHRoaXMueCA9IHRoaXMueSA9IHZhbHVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy54ID0gdmFsdWUueDtcclxuXHRcdFx0dGhpcy55ID0gdmFsdWUueTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBjbG9uZSgpOiBWZWN0b3Ige1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG1hZ25pdHVkZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGFkZCh2ZWMxOiBWZWN0b3IsIHZlYzI6IFZlY3Rvcik6IFZlY3RvciB7XHJcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih2ZWMxLnggKyB2ZWMyLngsIHZlYzEueSArIHZlYzIueSk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgc3VidHJhY3QodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjMS54IC0gdmVjMi54LCB2ZWMxLnkgLSB2ZWMyLnkpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIG11bHRpcGx5KHZlYzogVmVjdG9yLCBzY2FsYXI6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjLnggKiBzY2FsYXIsIHZlYy55ICogc2NhbGFyKTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBmcm9tKHBvaW50OiBQb2ludCkge1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IocG9pbnQueCwgcG9pbnQueSk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgR2FtZSwgQ29uZmlnIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdHByaXZhdGUgX3RpbGUgPSB7XHJcblx0XHR3aWR0aCA6IDMwLFxyXG5cdFx0aGVpZ2h0OiAzMFxyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqXHRTcHJpdGVzIEkgdXNlIGZvciBhIGRldmVsb3BtZW50IHdlcmUgY3JlYXRlZCBieSBDb2R5IFNoZXBwIGZvciBoaXMgZ2FtZSBEZW50YWwgRGVmZW5kZXI6IFNhZ2Egb2YgdGhlIENhbmR5IEhvcmRlLlxyXG5cdCAqXHRQbGVhc2UgY2hlY2sgaGlzIGdpdGh1YiByZXBvOiBodHRwczovL2dpdGh1Yi5jb20vY3NoZXBwL2NhbmR5amFtL1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3Jlc291cmNlcyA9IHtcclxuXHRcdCdwbGF5ZXInIDogJy4vaW1nL3BsYXllci5wbmcnLFxyXG5cdFx0J2VuZW15JyA6ICcuL2ltZy9lbmVteS5wbmcnLFxyXG5cdFx0J2J1bGxldCcgOiAnLi9pbWcvYnVsbGV0LnBuZycsXHJcblx0XHQnd2FsbCc6ICcuL2ltZy90cmVlLXJlZC0xLnBuZydcclxuXHJcblx0fVxyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlclRpbGUocG9zOiBQb2ludCwgY29sb3I6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LnJlY3QocG9zLngsIHBvcy55LCB0aGlzLl90aWxlLndpZHRoLCB0aGlzLl90aWxlLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5maWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW5kZXJUaWxlcygpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNvbG9ycyA9IFtcIiM3ODVjOThcIiwgXCIjNjk0Zjg4XCJdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMuX2dhbWUubWFwLndpZHRoOyB4ICs9IHRoaXMuX3RpbGUud2lkdGgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQ7IHkgKz0gdGhpcy5fdGlsZS5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcclxuICAgICAgICAgICAgICAgIGxldCB5SW5kZXggPSAoeSAvIHRoaXMuX3RpbGUuaGVpZ2h0KSAlIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGVQb3MgPSB0aGlzLmNhbWVyYU9mZnNldCh7eCwgeX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlUG9zLCBjb2xvcnNbeEluZGV4IF4geUluZGV4XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW1lcmFPZmZzZXQocG9zOiBQb2ludCkgOiBQb2ludCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckhlbHBlcihzb3VyY2UgOiBzdHJpbmcsIGNvbGxlY3Rpb24gOiBFbnRpdHlbXSkge1xyXG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0aW1nLnNyYyA9IHNvdXJjZTtcclxuXHJcblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHtcclxuXHRcdFx0bGV0IGZyYW1lID0gZS5jdXJyZW50QW5pbWF0aW9uLmN1cnJlbnRGcmFtZTtcclxuXHRcdFx0bGV0IHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KGUuYm9keS5wb3NpdGlvbik7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fZ2FtZS5jb25maWcuc2hvd0FBQkIpIHtcclxuXHRcdFx0XHR0aGlzLnJlbmRlckFBQkIobmV3IEJvZHkobmV3IFZlY3Rvcihwb3MueCwgcG9zLnkpLCBlLmJvZHkud2lkdGgsIGUuYm9keS5oZWlnaHQpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmRyYXdJbWFnZShcclxuXHRcdFx0XHRpbWcsXHJcblx0XHRcdFx0ZnJhbWUueCwgZnJhbWUueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0LFxyXG5cdFx0XHRcdHBvcy54LCBwb3MueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckhwQmFyKGU6IEVudGl0eSkge1xyXG5cdFx0bGV0IGJhclNpemUgPSB7IHdpZHRoOiA1MCwgaGVpZ2h0OiA1IH07XHJcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xyXG5cdFx0bGV0IHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KFZlY3Rvci5zdWJ0cmFjdChlLmJvZHkucG9zaXRpb24sIG5ldyBWZWN0b3IoNSwgMTUpKSk7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnJlY3QoXHJcblx0XHRcdHBvcy54LFxyXG5cdFx0XHRwb3MueSxcclxuXHRcdFx0YmFyU2l6ZS53aWR0aCxcclxuXHRcdFx0YmFyU2l6ZS5oZWlnaHRcclxuXHRcdCk7XHJcblxyXG5cdFx0dmFyIGdyZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudChwb3MueCwgcG9zLnksIHBvcy54ICsgYmFyU2l6ZS53aWR0aCwgcG9zLnkgKyBiYXJTaXplLmhlaWdodCk7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDAsIFwicmVkXCIpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcChlLmhlYWx0aCAvIDEwMCwgXCJyZWRcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKGUuaGVhbHRoIC8gMTAwLCBcImJsYWNrXCIpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgxLCBcImJsYWNrXCIpO1xyXG5cclxuXHRcdGN0eC5maWxsU3R5bGUgPSBncmQ7XHJcblx0XHRjdHguZmlsbCgpO1xyXG5cdH1cclxuXHJcblx0Ly8gdG9kbzogZXh0cmFjdCBocC1iYXIgcmVuZGVyaW5nIGxvZ2ljXHJcblx0cHJpdmF0ZSByZW5kZXJIdWQoKTogdm9pZCB7XHJcblx0XHRsZXQgb2Zmc2V0ID0gMjA7XHJcblxyXG5cdFx0bGV0IGJhclNpemUgPSB7IHdpZHRoOiAxNTAsIGhlaWdodDogMTAgfTtcclxuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnJlY3QoXHJcblx0XHRcdG9mZnNldCxcclxuXHRcdFx0dGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0ICogMS4yLFxyXG5cdFx0XHRiYXJTaXplLndpZHRoLFxyXG5cdFx0XHRiYXJTaXplLmhlaWdodFxyXG5cdFx0KTtcclxuXHJcblxyXG5cdFx0dmFyIGdyZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudChvZmZzZXQsIHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCAtIG9mZnNldCwgb2Zmc2V0ICsgYmFyU2l6ZS53aWR0aCwgdGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0ICsgYmFyU2l6ZS5oZWlnaHQpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgwLCBcIiM0Y2FmNTBcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKHRoaXMuX2dhbWUucGxheWVyLmhlYWx0aCAvIDEwMCwgXCIjNGNhZjUwXCIpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCh0aGlzLl9nYW1lLnBsYXllci5oZWFsdGggLyAxMDAsIFwiYmxhY2tcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDEsIFwiYmxhY2tcIik7XHJcblxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGdyZDtcclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiIzE4MjUyNFwiO1xyXG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcblx0XHRjdHguZmlsbCgpO1xyXG5cdFx0Y3R4LnN0cm9rZSgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJBQUJCKGJvZHk6IEJvZHkpIHtcclxuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnRyYW5zbGF0ZSgwLjUsIDAuNSk7XHJcblx0XHRjdHgucmVjdChcclxuXHRcdFx0Ym9keS5wb3NpdGlvbi54LFxyXG5cdFx0XHRib2R5LnBvc2l0aW9uLnksXHJcblx0XHRcdGJvZHkud2lkdGgsXHJcblx0XHRcdGJvZHkuaGVpZ2h0XHJcblx0XHQpO1xyXG5cclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XHJcblx0XHRjdHgubGluZVdpZHRoID0gMTtcclxuXHRcdGN0eC5zdHJva2UoKTtcclxuXHRcdGN0eC50cmFuc2xhdGUoLTAuNSwgLTAuNSk7XHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jbGVhcigpO1xyXG5cclxuXHRcdHRoaXMucmVuZGVyVGlsZXMoKTtcclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snYnVsbGV0J10sIHRoaXMuX2dhbWUuYnVsbGV0cyk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2VuZW15J10sIHRoaXMuX2dhbWUuZW5lbWllcyk7XHJcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaChlID0+IHtcclxuXHRcdFx0dGhpcy5yZW5kZXJIcEJhcihlKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1sncGxheWVyJ10sIFt0aGlzLl9nYW1lLnBsYXllcl0pO1xyXG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWyd3YWxsJ10sIHRoaXMuX2dhbWUud2FsbHMpO1xyXG5cdFx0dGhpcy5yZW5kZXJIdWQoKTtcclxuXHR9XHJcblxyXG5cdGNsZWFyKCkgOiB2b2lkIHtcclxuXHRcdGxldCB3ID0gdGhpcy5fZ2FtZS5jYW52YXMud2lkdGg7XHJcblx0XHRsZXQgaCA9IHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodDtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFVwZGF0ZXIge1xyXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhbGxFbnRpdGllcygpIDogRW50aXR5W10ge1xyXG5cdFx0cmV0dXJuIDxFbnRpdHlbXT4gQXJyYXkucHJvdG90eXBlLmNvbmNhdChcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLFxyXG5cdFx0XHR0aGlzLl9nYW1lLmVuZW1pZXMsXHJcblx0XHRcdHRoaXMuX2dhbWUucGxheWVyXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb25zKCkgOiB2b2lkIHtcclxuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcclxuXHJcblx0XHRlbnRpdGllcy5mb3JFYWNoKChlKT0+IHsgZS5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZSh0aGlzLl9nYW1lLmdhbWVUaW1lKTsgfSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZUVudGl0aWVzKCkgOiB2b2lkIHtcclxuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcclxuXHJcblx0XHRlbnRpdGllcy5mb3JFYWNoKGUgPT4geyBlLnVwZGF0ZSgpOyB9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlRGVhZCgpIDogdm9pZCB7XHJcblx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuYnVsbGV0cyk7IH0pXHJcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuZW5lbWllcyk7IH0pXHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbW92ZURlYWQoZTogRW50aXR5LCBjb2xsZWN0aW9uOiBFbnRpdHlbXSkge1xyXG5cdFx0aWYgKGUuYWxpdmUgPT09IGZhbHNlKSB7XHJcblx0XHRcdGxldCBlSW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoZSk7XHJcblxyXG5cdFx0XHRpZiAoZUluZGV4ID4gLTEpIHtcclxuXHRcdFx0XHRjb2xsZWN0aW9uLnNwbGljZShlSW5kZXgsIDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy51cGRhdGVBbmltYXRpb25zKCk7XHJcblx0XHR0aGlzLnVwZGF0ZUVudGl0aWVzKCk7XHJcblx0XHR0aGlzLnVwZGF0ZURlYWQoKTtcclxuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudGFyZ2V0ID0gdGhpcy5fZ2FtZS5wbGF5ZXIuYm9keS5wb3NpdGlvbjtcclxuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudXBkYXRlKCk7XHJcblx0XHR0aGlzLl9nYW1lLmNvbGxpc2lvbnMudXBkYXRlKCk7XHJcblx0XHR0aGlzLl9nYW1lLmlucHV0LnVwZGF0ZSgpO1xyXG5cdH1cclxufSIsImltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge307XHJcblxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcblx0c3RhdGljIGNsYW1wKHZhbHVlIDogbnVtYmVyLCBtaW4gOiBudW1iZXIsIG1heCA6IG51bWJlcikgOiBudW1iZXIge1xyXG5cdFx0aWYgKHZhbHVlID4gbWF4KSB7IHJldHVybiBtYXg7IH1cclxuXHRcdGlmICh2YWx1ZSA8IG1pbikgeyByZXR1cm4gbWluOyB9XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcclxuXHRwdWJsaWMgdGFyZ2V0OiBQb2ludDtcclxuXHRwdWJsaWMgcG9zaXRpb246IFBvaW50ID0geyB4IDogMCwgeSA6IDAgfTtcclxuXHJcblx0cHJpdmF0ZSBfZ2FtZTogR2FtZTtcclxuXHRwcml2YXRlIF93aWR0aDogbnVtYmVyO1xyXG5cdHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0XHR0aGlzLl93aWR0aCA9IGdhbWVJbnN0YW5jZS5jYW52YXMud2lkdGg7XHJcblx0XHR0aGlzLl9oZWlnaHQgPSBnYW1lSW5zdGFuY2UuY2FudmFzLmhlaWdodDtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgY2FsY3VsYXRlUG9zaXRpb24oKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC54IC0gdGhpcy5fd2lkdGggLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC53aWR0aCAtIHRoaXMuX3dpZHRoKTtcclxuXHRcdHRoaXMucG9zaXRpb24ueSA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueSAtIHRoaXMuX2hlaWdodCAvIDIsIDAsIHRoaXMuX2dhbWUubWFwLmhlaWdodCAtIHRoaXMuX2hlaWdodCk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jYWxjdWxhdGVQb3NpdGlvbigpO1xyXG5cdH1cclxufSIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgV2FsbCBleHRlbmRzIEVudGl0eSB7XHJcbiAgICBwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKCksIDE1MSwgMjExKTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTUxLCAyMTEpKTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9pbnQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuYm9keS5wb3NpdGlvbiA9IFZlY3Rvci5mcm9tKHBvc2l0aW9uKTtcclxuICAgIH1cclxufSJdfQ==
