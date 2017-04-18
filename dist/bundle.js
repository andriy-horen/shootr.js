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
                physics_1.Physics.collide(enemy.body, bullet.body, function () {
                    enemy.damage(bullet.damageAmount, bullet.parent);
                    bullet.kill();
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
},{"./collision-manager":4,"./enemy":6,"./input":10,"./map":11,"./player":13,"./renderer":15,"./updater":16,"./viewport":18}],10:[function(require,module,exports){
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
}
exports.Physics = Physics;
},{}],13:[function(require,module,exports){
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
            'bullet': './img/bullet.png'
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
        this.renderHelper(this._resources['player'], [this._game.player]);
        this._game.enemies.forEach(e => {
            this.renderHpBar(e);
        });
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
},{"./util":17}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JlbmRlcmVyLnRzIiwic3JjL2pzL3VwZGF0ZXIudHMiLCJzcmMvanMvdXRpbC50cyIsInNyYy9qcy92aWV3cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNDQSxNQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUVqQztJQW1CQyxZQUFZLE1BQWMsRUFBRSxHQUFXLEVBQUUsS0FBWTtRQVo5QyxVQUFLLEdBQVksQ0FBQyxDQUFDO1FBTW5CLFNBQUksR0FBWSxJQUFJLENBQUM7UUFFcEIsa0JBQWEsR0FBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUsxQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQzVELENBQUM7SUFFRCxVQUFVLENBQUMsSUFBVztRQUNyQixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxD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QUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUtwRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVPLFdBQVcsQ0FBQyxRQUFlO1FBQzVCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7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QU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdFLENBQUM7SUFFTyxVQUFVLENBQUMsQ0FBUyxFQUFFLFVBQW9CO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5DLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNCLENBQUM7QUFDRixDQUFDO0FBbkRZLGVBQU8sVUFtRG5CLENBQUE7OztBQ3BERCxrQkFBd0IsQ0FBQztBQUFULFlBQUksT0FBSyxDQUFBO0FBQUEsQ0FBQztBQUUxQjtJQUNDLE9BQU8sS0FBSyxDQUFDLEtBQWMsRUFBRSxHQUFZLEVBQUUsR0FBWTtRQUN0RCxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUFDLENBQUM7UUFFaEMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDRixDQUFDO0FBUFksWUFBSSxPQU9oQixDQUFBOzs7QUNSRCx1QkFBcUIsUUFBUSxDQUFDLENBQUE7QUFFOUI7SUFRQyxZQUFZLFlBQWtCO1FBTnZCLGFBQVEsR0FBVSxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDO1FBT3pDLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMzQyxDQUFDO0lBRU8saUJBQWlCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsV0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6RyxDQUFDO0lBRUQsTUFBTTtRQUNMLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzFCLENBQUM7QUFDRixDQUFDO0FBdEJZLGdCQUFRLFdBc0JwQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCAqIGFzIENvbnN0IGZyb20gJy4vY29uc3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XHJcblx0cHVibGljIGN1cnJlbnRGcmFtZSA6IEZyYW1lO1xyXG5cclxuXHQvKipcclxuXHQgKiBOdW1iZXIgb2YgZnJhbWVzIHBlciBzZWNvbmRcclxuXHQgKiBAdHlwZSB7bnVtYmVyfVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDA7XHJcblx0LyoqXHJcblx0ICogVE9ETzogSW1wbGVtZW50LCBmaWVsZCBpcyBub3QgdXNlZCBcclxuXHQgKiBTZXQgdG8gdHJ1ZSB0byBtYWtlIGFuaW1hdGlvbiBsb29wZWQsIGZhbHNlIC0gZm9yIG9uZSBjeWNsZSBvbmx5XHJcblx0ICogQHR5cGUge2Jvb2xlYW59XHJcblx0ICovXHJcblx0cHVibGljIGxvb3A6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuXHRwcml2YXRlIF9sYXN0QW5pbWF0ZWQgOiBEYXRlID0gbmV3IERhdGUoMCk7XHJcblx0cHJpdmF0ZSBfcm93IDogbnVtYmVyO1xyXG5cdHByaXZhdGUgX2xlbmd0aCA6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IobGVuZ3RoOiBudW1iZXIsIHJvdzogbnVtYmVyLCBmcmFtZTogRnJhbWUpIHtcclxuXHRcdHRoaXMuX3JvdyA9IHJvdztcclxuXHRcdHRoaXMuX2xlbmd0aCA9IGxlbmd0aDtcclxuXHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IGZyYW1lO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueSA9IHRoaXMuX3JvdyAqIHRoaXMuY3VycmVudEZyYW1lLmhlaWdodDtcclxuXHR9XHJcblxyXG5cdGNhbkFuaW1hdGUodGltZSA6IERhdGUpIDogYm9vbGVhbiB7XHJcblx0XHRsZXQgYW5pbWF0aW9uRGVsdGEgPSB0aW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RBbmltYXRlZC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGFuaW1hdGlvbkRlbHRhID4gdGhpcy5kZWxheTtcclxuXHR9XHJcblxyXG5cdGdldCBkZWxheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIENvbnN0Lk1TX0lOX1NFQyAvIHRoaXMuc3BlZWQ7XHJcblx0fVxyXG5cclxuXHRuZXh0KCk6IHZvaWQge1xyXG5cdFx0bGV0IGluZGV4ID0gdGhpcy5jdXJyZW50RnJhbWUuaW5kZXg7XHJcblxyXG5cdFx0aW5kZXggPSAoaW5kZXggKyAxKSAlIHRoaXMuX2xlbmd0aDtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLmluZGV4ID0gaW5kZXg7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS54ID0gaW5kZXggKiB0aGlzLmN1cnJlbnRGcmFtZS53aWR0aDtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZShnYW1lVGltZTogRGF0ZSk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuQW5pbWF0ZShnYW1lVGltZSkpIHtcclxuXHRcdFx0dGhpcy5fbGFzdEFuaW1hdGVkID0gZ2FtZVRpbWU7XHJcblxyXG5cdFx0XHR0aGlzLm5leHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJlc2V0KCk6IHZvaWQge1xyXG5cdFx0dGhpcy5fbGFzdEFuaW1hdGVkID0gbmV3IERhdGUoMCk7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5pbmRleCA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS54ID0gMDtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4vd29ybGQnO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4vdXRpbCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9uQ29sbGlkZSB7XHJcblx0KG9iajogRW50aXR5IHwgV29ybGQpIDogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvZHkge1xyXG5cdHBvc2l0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XHJcblx0dmVsb2NpdHk6IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcclxuXHRvdmVybGFwOiBWZWN0b3IgPSAgbmV3IFZlY3RvcigpOyBcclxuXHRzcGVlZCA6IG51bWJlcjtcclxuXHR3aWR0aCA6IG51bWJlcjtcclxuXHRoZWlnaHQgOiBudW1iZXI7XHJcblxyXG5cdG9uQ29sbGlkZTogT25Db2xsaWRlO1xyXG5cdGNvbGxpZGVXb3JsZEJvdW5kczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE86IE5lZWRzIHRvIGJlIGltcHJvdmVkIGJlYWNhdXNlIG1vcmUgRlBTIHJlc3VsdHMgaW4gZmFzdGVyIG1vdmVtZW50O1xyXG5cdHByaXZhdGUgdXBkYXRlTW92ZW1lbnQoKTp2b2lkIHtcclxuXHRcdHRoaXMucG9zaXRpb24gPSBWZWN0b3IuYWRkKHRoaXMucG9zaXRpb24sIHRoaXMudmVsb2NpdHkpO1xyXG5cclxuXHRcdHRoaXMuc3BlZWQgPSBNYXRoLmh5cG90KHRoaXMudmVsb2NpdHkueCwgdGhpcy52ZWxvY2l0eS55KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdHRoaXMudXBkYXRlTW92ZW1lbnQoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVsbGV0IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwdWJsaWMgdGFyZ2V0IDogUG9pbnQ7XHJcblx0cHVibGljIHBhcmVudCA6IEVudGl0eTtcclxuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAxMDtcclxuXHRwdWJsaWMgZGFtYWdlQW1vdW50IDogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigpLCAzLCAzKTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTAsIDEwKSk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCwgdGFyZ2V0OiBQb2ludCwgcGFyZW50IDogRW50aXR5KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuYm9keS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG5cclxuXHRcdHRoaXMuc2V0VmVsb2NpdHkodGhpcy50YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRWZWxvY2l0eShwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgbGV0IGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xyXG5cclxuICAgICAgICBsZXQgeCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcclxuICAgICAgICBsZXQgeSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih4LCB5KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLmJvZHkudXBkYXRlKCk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBQaHlzaWNzIH0gZnJvbSAnLi9waHlzaWNzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25NYW5hZ2VyIHsgXHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKChidWxsZXQpID0+IHtcclxuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUoZW5lbXkuYm9keSwgYnVsbGV0LmJvZHksIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdGVuZW15LmRhbWFnZShidWxsZXQuZGFtYWdlQW1vdW50LCBidWxsZXQucGFyZW50KTtcclxuXHJcblx0XHRcdFx0XHRidWxsZXQua2lsbCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxufSIsImV4cG9ydCBjb25zdCBNU19JTl9TRUMgPSAxMDAwO1xyXG4iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XHJcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XHJcblx0XHRcdCdpZGxlJyA6IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxyXG5cdFx0XHQncmlnaHQnIDogbmV3IEFuaW1hdGlvbig0LCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRcdCdsZWZ0JyA6IG5ldyBBbmltYXRpb24oNCwgMSwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpXHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG4gICAgcHVibGljIHNwZWVkIDogbnVtYmVyID0gMztcclxuICAgIHB1YmxpYyB0YXJnZXQgOiBFbnRpdHk7XHJcbiAgICBwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKDEwMCwgMTAwKSwgMzYsIDM2KTtcclxuXHJcblx0Y29uc3RydWN0b3IodGFyZ2V0OiBFbnRpdHkpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cclxuXHRcdHRoaXMuYW5pbWF0ZSgncmlnaHQnKTtcclxuXHR9XHJcblxyXG5cdGFuaW1hdGUoYW5pbWF0aW9uIDogc3RyaW5nKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTA7XHJcblx0fVxyXG5cclxuICAgIC8vIFRPRE8gOiBpbnZlc3RpZ2F0ZSBpc3N1ZSB3aXRoIGRpYWdvbmFsIHNwZWVkLiB+Mi4xMiB3aGVuIGlzIHN1cHBvc2VkIHRvIGJlIDNcclxuXHRtb3ZlVG93YXJkcyhwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XHJcbiAgICAgICAgbGV0IGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyWCA9IE1hdGguc2lnbihwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xyXG4gICAgICAgIGxldCBkaXJZID0gTWF0aC5zaWduKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xyXG5cclxuICAgICAgICBpZiAoZGlyWCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgnbGVmdCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMubW92ZVRvd2FyZHModGhpcy50YXJnZXQuYm9keS5wb3NpdGlvbik7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJFbmVteSBzcGVlZDogXCIgKyB0aGlzLmJvZHkuc3BlZWQpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVudGl0eSB7XHJcblx0cHJpdmF0ZSBfaGVhbHRoIDogbnVtYmVyID0gMTAwO1xyXG5cdHByaXZhdGUgX2FsaXZlIDogYm9vbGVhbiA9IHRydWU7XHJcblx0cHJpdmF0ZSBfYXR0YWNrZXIgOiBFbnRpdHk7XHJcblxyXG5cdHB1YmxpYyBib2R5IDogQm9keTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbiA6IEFuaW1hdGlvbjtcclxuXHJcblx0Z2V0IGhlYWx0aCgpIDogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9oZWFsdGg7XHJcblx0fVxyXG5cclxuXHRnZXQgYWxpdmUoKSA6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2FsaXZlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfc2V0SGVhbHRoKG51bWJlcjogbnVtYmVyKSB7XHJcblx0XHRpZiAodGhpcy5faGVhbHRoID4gMCAmJiB0aGlzLl9hbGl2ZSkge1xyXG5cdFx0XHR0aGlzLl9oZWFsdGggKz0gbnVtYmVyO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9oZWFsdGggPD0gMCkge1xyXG5cdFx0XHR0aGlzLmtpbGwoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGtpbGwoKSB7XHJcblx0XHR0aGlzLl9oZWFsdGggPSAwO1xyXG5cdFx0dGhpcy5fYWxpdmUgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGRhbWFnZShhbW91bnQgOiBudW1iZXIsIGF0dGFja2VyOiBFbnRpdHkpIDogdm9pZCB7XHJcblx0XHR0aGlzLl9zZXRIZWFsdGgoLWFtb3VudCk7XHJcblxyXG5cdFx0dGhpcy5fYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuXHR9XHJcblxyXG5cdGhlYWwoYW1vdW50IDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLl9zZXRIZWFsdGgoYW1vdW50KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHt9XHJcbn0iLCJpbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgRnJhbWUge1xyXG5cdGluZGV4IDogbnVtYmVyID0gMDtcclxuXHR4OiBudW1iZXIgPSAwO1xyXG5cdHk6IG51bWJlciA9IDA7XHJcblx0d2lkdGg6IG51bWJlciA9IDA7XHJcblx0aGVpZ2h0OiBudW1iZXIgPSAwO1xyXG5cdG5hbWUgOiBzdHJpbmc7XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWUge1xyXG5cdFx0bGV0IGZyYW1lID0gbmV3IEZyYW1lKCk7XHJcblxyXG5cdFx0ZnJhbWUueCA9IHg7XHJcblx0XHRmcmFtZS55ID0geTtcclxuXHRcdGZyYW1lLndpZHRoID0gd2lkdGg7XHJcblx0XHRmcmFtZS5oZWlnaHQgPSBoZWlnaHQ7XHJcblx0XHRmcmFtZS5uYW1lID0gbmFtZTtcclxuXHJcblx0XHRyZXR1cm4gZnJhbWU7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEJ1bGxldCB9IGZyb20gJy4vYnVsbGV0JztcclxuaW1wb3J0IHsgQ29sbGlzaW9uTWFuYWdlciB9IGZyb20gJy4vY29sbGlzaW9uLW1hbmFnZXInO1xyXG5pbXBvcnQgeyBFbmVteSB9IGZyb20gJy4vZW5lbXknO1xyXG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XHJcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJy4vcGxheWVyJztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyZXInO1xyXG5pbXBvcnQgeyBVcGRhdGVyIH0gZnJvbSAnLi91cGRhdGVyJzsgXHJcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XHJcblx0Y29udGFpbmVyIDogc3RyaW5nO1xyXG5cdHNob3dBQUJCIDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG5cdHB1YmxpYyBjb25maWcgOiBDb25maWc7XHJcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cdHB1YmxpYyBpc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XHJcblx0cHVibGljIGJ1bGxldHM6IEJ1bGxldFtdID0gW107XHJcblx0cHVibGljIGVuZW1pZXM6IEVuZW15W10gPSBbXTtcclxuXHJcblx0cHVibGljIGdhbWVUaW1lOiBEYXRlO1xyXG5cclxuXHRwdWJsaWMgbWFwOiBNYXA7XHJcblx0cHVibGljIGlucHV0OiBJbnB1dDtcclxuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xyXG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XHJcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XHJcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XHJcblx0cHVibGljIG1vdXNlOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG5cdC8qKlxyXG5cdCAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSB1bmlxdWUgSUQ7IHVzZWQgdG8gY2FuY2VsIFJBRi1sb29wXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRwcml2YXRlIF9yYWZJZCA6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcclxuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdFx0dGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29uZmlnLmNvbnRhaW5lcik7XHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHRcdHRoaXMucGxheWVyID0gbmV3IFBsYXllcih0aGlzKTtcclxuXHRcdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG5cdFx0dGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzKTtcclxuXHRcdHRoaXMudmlld3BvcnQgPSBuZXcgVmlld3BvcnQodGhpcyk7XHJcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHRoaXMpO1xyXG5cdFx0dGhpcy51cGRhdGVyID0gbmV3IFVwZGF0ZXIodGhpcyk7XHJcblx0XHR0aGlzLmNvbGxpc2lvbnMgPSBuZXcgQ29sbGlzaW9uTWFuYWdlcih0aGlzKTtcclxuXHRcdHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLnBsYXllcikpO1xyXG5cdH1cclxuXHJcblx0dGljaygpIDogdm9pZCB7XHJcblx0XHR0aGlzLmdhbWVUaW1lID0gbmV3IERhdGUoKTtcclxuXHJcblx0XHRpZiAodGhpcy5pc1J1bm5pbmcpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcclxuXHRcdFx0dGhpcy51cGRhdGVyLnVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljay5iaW5kKHRoaXMpKTtcclxuXHR9XHJcblxyXG5cdHJ1bigpIDogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5pc1J1bm5pbmcgPT09IGZhbHNlKSB7XHJcblx0XHRcdHRoaXMudGljaygpO1xyXG5cclxuXHRcdFx0dGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3RvcCgpIDogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5pc1J1bm5pbmcpIHtcclxuXHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmSWQpO1xyXG5cclxuXHRcdFx0dGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmxldCBnYW1lID0gbmV3IEdhbWUoe1xyXG5cdGNvbnRhaW5lcjogJy5nYW1lJyxcclxuXHRzaG93QUFCQjogZmFsc2VcclxufSk7XHJcblxyXG5nYW1lLnJ1bigpOyIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XHJcblxyXG5leHBvcnQgZW51bSBBY3Rpb24geyBcclxuXHRVcCwgXHJcblx0RG93bixcclxuXHRMZWZ0LFxyXG5cdFJpZ2h0LFxyXG5cdEF0dGFja1xyXG59XHJcblxyXG5lbnVtIEtleSB7XHJcblx0VyA9IDg3LFxyXG5cdEEgPSA2NSxcclxuXHRTID0gODMsXHJcblx0RCA9IDY4LFxyXG5cdFVwID0gMzgsXHJcblx0RG93biA9IDQwLFxyXG5cdExlZnQgPSAzNyxcclxuXHRSaWdodCA9IDM5XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbnB1dCB7XHJcblx0cHJpdmF0ZSBfYmluZGluZ3MgOiBNYXA8QWN0aW9uPiA9IHtcclxuXHRcdFtLZXkuV10gOiBBY3Rpb24uVXAsXHJcblx0XHRbS2V5LkFdIDogQWN0aW9uLkxlZnQsXHJcblx0XHRbS2V5LlNdIDogQWN0aW9uLkRvd24sXHJcblx0XHRbS2V5LkRdIDogQWN0aW9uLlJpZ2h0LFxyXG5cdFx0W0tleS5VcF0gOiBBY3Rpb24uVXAsXHJcblx0XHRbS2V5LkRvd25dIDogQWN0aW9uLkRvd24sXHJcblx0XHRbS2V5LkxlZnRdIDogQWN0aW9uLkxlZnQsXHJcblx0XHRbS2V5LlJpZ2h0XSA6IEFjdGlvbi5SaWdodFxyXG5cdH07XHJcblxyXG5cdHB1YmxpYyBhY3Rpb25zIDogTWFwPGJvb2xlYW4+ID0ge307XHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblx0cHJpdmF0ZSBfbW91c2VQb3M6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcC5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuZ2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24uYmluZCh0aGlzKSk7XHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcC5iaW5kKHRoaXMpKTtcclxuXHR9XHJcblxyXG5cdGJpbmQoa2V5OiBLZXksIGFjdGlvbjogQWN0aW9uKSB7XHJcblx0XHR0aGlzLnVuYmluZChrZXkpO1xyXG5cclxuXHRcdHRoaXMuX2JpbmRpbmdzW2tleV0gPSBhY3Rpb247XHJcblx0fVxyXG5cclxuXHR1bmJpbmQoa2V5OiBLZXkpIHtcclxuXHRcdGlmICh0aGlzLl9iaW5kaW5nc1trZXldKSB7XHJcblx0XHRcdGRlbGV0ZSB0aGlzLl9iaW5kaW5nc1trZXldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbktleURvd24oZTogS2V5Ym9hcmRFdmVudCkgeyBcclxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcclxuXHJcblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbktleVVwKGU6IEtleWJvYXJkRXZlbnQpIHtcclxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcclxuXHJcblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSBmYWxzZTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0dGhpcy5nZXRNb3VzZVBvc2l0aW9uKGUpO1xyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gdHJ1ZTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpIHtcclxuXHRcdGNvbnN0IGxlZnRCdXR0b24gPSAwO1xyXG5cclxuXHRcdGlmIChlLmJ1dHRvbiA9PSBsZWZ0QnV0dG9uKSB7XHJcblx0XHRcdHRoaXMuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVE9ETyA6IE5lZWRzIGJldHRlciBpbXBsZW1lbnRhdGlvblxyXG5cdHByaXZhdGUgZ2V0TW91c2VQb3NpdGlvbihlOiBNb3VzZUV2ZW50KSB7IFxyXG5cdFx0bGV0IGNhbnZhc09mZnNldCA9IHRoaXMuX2dhbWUuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHRcdHRoaXMuX21vdXNlUG9zID0ge1xyXG5cdCAgICAgIHg6IGUuY2xpZW50WCAtIGNhbnZhc09mZnNldC5sZWZ0LFxyXG5cdCAgICAgIHk6IGUuY2xpZW50WSAtIGNhbnZhc09mZnNldC50b3BcclxuXHQgICAgfTtcclxuXHJcblx0ICAgXHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0dGhpcy5fZ2FtZS5tb3VzZSA9IHtcclxuXHRcdFx0eDogdGhpcy5fbW91c2VQb3MueCArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuXHRcdFx0eTogdGhpcy5fbW91c2VQb3MueSArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueVxyXG5cdFx0fVxyXG5cdH1cclxufSIsImV4cG9ydCBjbGFzcyBNYXAgeyBcclxuXHRwdWJsaWMgd2lkdGggOiBudW1iZXIgPSAyMDAwO1xyXG5cdHB1YmxpYyBoZWlnaHQgOiBudW1iZXIgPSAxNTAwO1xyXG59IiwiaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFBoeXNpY3Mge1xyXG5cdCAvKipcclxuICAgICAqIENoZWNrcyBpZiB0d28gcmVjdGFuZ3VsYXIgYm9kaWVzIGludGVyc2VjdFxyXG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTEgRmlyc3QgYm9keSB3aXRoIHt4LHl9IHBvc2l0aW9uIGFuZCB7d2lkdGgsIGhlaWdodH1cclxuICAgICAqIEBwYXJhbSAge1JlY3R9IGJvZHkyIFNlY29uZCBib2R5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sfSBUcnVlIGlmIHRoZXkgaW50ZXJzZWN0LCBvdGhlcndpc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGludGVyc2VjdHMoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5KSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25YID0gYm9keTEucG9zaXRpb24ueCA8IGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCBcclxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi54ICsgYm9keTEud2lkdGggPiBib2R5Mi5wb3NpdGlvbi54O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25ZID0gYm9keTEucG9zaXRpb24ueSA8IGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQgXHJcbiAgICAgICAgXHRcdFx0XHQgJiYgYm9keTEucG9zaXRpb24ueSArIGJvZHkxLmhlaWdodCA+IGJvZHkyLnBvc2l0aW9uLnk7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25YICYmIGludGVyc2VjdGlvblk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvbGxpZGUoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5LCBjb2xsaXNpb25DYWxsYmFjazogRnVuY3Rpb24pIDogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhib2R5MSwgYm9keTIpKSB7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkNhbGxiYWNrKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJy4vdXRpbCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigxMCwgMTApLCAzNiwgMzYpO1xyXG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMztcclxuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XHJcblxyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcclxuXHQgICAgJ2lkbGUnIDogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcclxuXHR9O1xyXG5cdHByaXZhdGUgX2J1bGxldE9mZnNldCA6IFBvaW50ID0geyB4OiAxMiwgeTogMTggfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xyXG5cdH1cclxuXHJcblx0c2hvb3QoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIHsgXHJcblx0XHRcdFx0eDogdGhpcy5ib2R5LnBvc2l0aW9uLnggKyB0aGlzLl9idWxsZXRPZmZzZXQueCwgXHJcblx0XHRcdFx0eTogdGhpcy5ib2R5LnBvc2l0aW9uLnkgKyB0aGlzLl9idWxsZXRPZmZzZXQueSBcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRTcGF3biwgdGhpcy5fZ2FtZS5tb3VzZSwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhblNob290KCkgOiBib29sZWFuIHtcclxuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb24gOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGF0ZU1vdmVtZW50KCkgOiB2b2lkIHtcclxuXHRcdGxldCBpbnB1dCA9IHRoaXMuX2dhbWUuaW5wdXQ7XHJcblxyXG5cdFx0bGV0IG1vdmluZ1ggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF07XHJcblx0XHRsZXQgbW92aW5nWSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5Eb3duXTtcclxuXHJcblx0XHRsZXQgc3BlZWQgPSBtb3ZpbmdYICYmIG1vdmluZ1kgPyBNYXRoLnNxcnQodGhpcy5zcGVlZCAqIHRoaXMuc3BlZWQgLyAyKSA6IHRoaXMuc3BlZWQ7XHJcblxyXG5cdFx0bGV0IGRpcmVjdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xyXG5cclxuXHRcdGRpcmVjdGlvbi54ID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0gID8gLTEgOiAxLFxyXG5cdFx0ZGlyZWN0aW9uLnkgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gPyAtMSA6IDFcclxuXHJcblx0XHRkaXJlY3Rpb24ueCA9IG1vdmluZ1ggPyBkaXJlY3Rpb24ueCA6IDA7XHJcblx0XHRkaXJlY3Rpb24ueSA9IG1vdmluZ1kgPyBkaXJlY3Rpb24ueSA6IDA7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIHNwZWVkO1xyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIHNwZWVkO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKFwiUGxheWVyIHNwZWVkOiBcIiArIHRoaXMuYm9keS5zcGVlZCk7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cclxuXHRcdGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdKSB7XHJcblx0ICAgICAgICB0aGlzLnNob290KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZUFuaW1hdGlvbigpIHtcclxuXHRcdGxldCBhbmltYXRpb24gPSB0aGlzLl9nYW1lLm1vdXNlLnggPiB0aGlzLmJvZHkucG9zaXRpb24ueCA/ICdyaWdodCcgOiAnbGVmdCc7XHJcblxyXG5cdFx0dGhpcy5hbmltYXRlKGFuaW1hdGlvbik7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy51cGF0ZU1vdmVtZW50KCk7XHJcblx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbigpO1xyXG5cdH1cclxufVxyXG4iLCJleHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcclxuXHR4IDogbnVtYmVyO1xyXG5cdHkgOiBudW1iZXI7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlY3QgeyBcclxuXHR4OiBudW1iZXI7XHJcblx0eTogbnVtYmVyO1xyXG5cdHdpZHRoOiBudW1iZXI7XHJcblx0aGVpZ2h0OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBWZWN0b3Ige1xyXG5cdHggOiBudW1iZXIgPSAwO1xyXG5cdHkgOiBudW1iZXIgPSAwO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwKSB7XHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQodmFsdWU6IG51bWJlciB8IFZlY3Rvcik6IHZvaWQge1xyXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xyXG5cdFx0XHR0aGlzLnggPSB0aGlzLnkgPSB2YWx1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMueCA9IHZhbHVlLng7XHJcblx0XHRcdHRoaXMueSA9IHZhbHVlLnk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgY2xvbmUoKTogVmVjdG9yIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBtYWduaXR1ZGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBhZGQodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjMS54ICsgdmVjMi54LCB2ZWMxLnkgKyB2ZWMyLnkpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIHN1YnRyYWN0KHZlYzE6IFZlY3RvciwgdmVjMjogVmVjdG9yKTogVmVjdG9yIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYzEueCAtIHZlYzIueCwgdmVjMS55IC0gdmVjMi55KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBtdWx0aXBseSh2ZWM6IFZlY3Rvciwgc2NhbGFyOiBudW1iZXIpIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYy54ICogc2NhbGFyLCB2ZWMueSAqIHNjYWxhcik7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgR2FtZSwgQ29uZmlnIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdHByaXZhdGUgX3RpbGUgPSB7XHJcblx0XHR3aWR0aCA6IDMwLFxyXG5cdFx0aGVpZ2h0OiAzMFxyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqXHRTcHJpdGVzIEkgdXNlIGZvciBhIGRldmVsb3BtZW50IHdlcmUgY3JlYXRlZCBieSBDb2R5IFNoZXBwIGZvciBoaXMgZ2FtZSBEZW50YWwgRGVmZW5kZXI6IFNhZ2Egb2YgdGhlIENhbmR5IEhvcmRlLlxyXG5cdCAqXHRQbGVhc2UgY2hlY2sgaGlzIGdpdGh1YiByZXBvOiBodHRwczovL2dpdGh1Yi5jb20vY3NoZXBwL2NhbmR5amFtL1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3Jlc291cmNlcyA9IHtcclxuXHRcdCdwbGF5ZXInIDogJy4vaW1nL3BsYXllci5wbmcnLFxyXG5cdFx0J2VuZW15JyA6ICcuL2ltZy9lbmVteS5wbmcnLFxyXG5cdFx0J2J1bGxldCcgOiAnLi9pbWcvYnVsbGV0LnBuZydcclxuXHR9XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVyVGlsZShwb3M6IFBvaW50LCBjb2xvcjogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQucmVjdChwb3MueCwgcG9zLnksIHRoaXMuX3RpbGUud2lkdGgsIHRoaXMuX3RpbGUuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbmRlclRpbGVzKCkgOiB2b2lkIHtcclxuICAgICAgICBsZXQgY29sb3JzID0gW1wiIzc4NWM5OFwiLCBcIiM2OTRmODhcIl07XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5fZ2FtZS5tYXAud2lkdGg7IHggKz0gdGhpcy5fdGlsZS53aWR0aCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuX2dhbWUubWFwLmhlaWdodDsgeSArPSB0aGlzLl90aWxlLmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHhJbmRleCA9ICh4IC8gdGhpcy5fdGlsZS53aWR0aCkgJSAyO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlJbmRleCA9ICh5IC8gdGhpcy5fdGlsZS5oZWlnaHQpICUgMjtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZVBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KHt4LCB5fSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaWxlKHRpbGVQb3MsIGNvbG9yc1t4SW5kZXggXiB5SW5kZXhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbWVyYU9mZnNldChwb3M6IFBvaW50KSA6IFBvaW50IHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6IHBvcy54IC0gc2VsZi5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5OiBwb3MueSAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVySGVscGVyKHNvdXJjZSA6IHN0cmluZywgY29sbGVjdGlvbiA6IEVudGl0eVtdKSB7XHJcblx0XHRsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcblx0XHRpbWcuc3JjID0gc291cmNlO1xyXG5cclxuXHRcdGNvbGxlY3Rpb24uZm9yRWFjaCgoZSkgPT4ge1xyXG5cdFx0XHRsZXQgZnJhbWUgPSBlLmN1cnJlbnRBbmltYXRpb24uY3VycmVudEZyYW1lO1xyXG5cdFx0XHRsZXQgcG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoZS5ib2R5LnBvc2l0aW9uKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLl9nYW1lLmNvbmZpZy5zaG93QUFCQikge1xyXG5cdFx0XHRcdHRoaXMucmVuZGVyQUFCQihuZXcgQm9keShuZXcgVmVjdG9yKHBvcy54LCBwb3MueSksIGUuYm9keS53aWR0aCwgZS5ib2R5LmhlaWdodCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9nYW1lLmNvbnRleHQuZHJhd0ltYWdlKFxyXG5cdFx0XHRcdGltZyxcclxuXHRcdFx0XHRmcmFtZS54LCBmcmFtZS55LFxyXG5cdFx0XHRcdGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHQsXHJcblx0XHRcdFx0cG9zLngsIHBvcy55LFxyXG5cdFx0XHRcdGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHRcclxuXHRcdFx0KTtcclxuXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVySHBCYXIoZTogRW50aXR5KSB7XHJcblx0XHRsZXQgYmFyU2l6ZSA9IHsgd2lkdGg6IDUwLCBoZWlnaHQ6IDUgfTtcclxuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XHJcblx0XHRsZXQgcG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoVmVjdG9yLnN1YnRyYWN0KGUuYm9keS5wb3NpdGlvbiwgbmV3IFZlY3Rvcig1LCAxNSkpKTtcclxuXHJcblx0XHRjdHguYmVnaW5QYXRoKCk7XHJcblx0XHRjdHgucmVjdChcclxuXHRcdFx0cG9zLngsXHJcblx0XHRcdHBvcy55LFxyXG5cdFx0XHRiYXJTaXplLndpZHRoLFxyXG5cdFx0XHRiYXJTaXplLmhlaWdodFxyXG5cdFx0KTtcclxuXHJcblx0XHR2YXIgZ3JkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KHBvcy54LCBwb3MueSwgcG9zLnggKyBiYXJTaXplLndpZHRoLCBwb3MueSArIGJhclNpemUuaGVpZ2h0KTtcclxuXHRcdGdyZC5hZGRDb2xvclN0b3AoMCwgXCJyZWRcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKGUuaGVhbHRoIC8gMTAwLCBcInJlZFwiKTtcclxuXHRcdGdyZC5hZGRDb2xvclN0b3AoZS5oZWFsdGggLyAxMDAsIFwiYmxhY2tcIik7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDEsIFwiYmxhY2tcIik7XHJcblxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGdyZDtcclxuXHRcdGN0eC5maWxsKCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckFBQkIoYm9keTogQm9keSkge1xyXG5cdFx0bGV0IGN0eCA9IHRoaXMuX2dhbWUuY29udGV4dDtcclxuXHJcblx0XHRjdHguYmVnaW5QYXRoKCk7XHJcblx0XHRjdHgudHJhbnNsYXRlKDAuNSwgMC41KTtcclxuXHRcdGN0eC5yZWN0KFxyXG5cdFx0XHRib2R5LnBvc2l0aW9uLngsXHJcblx0XHRcdGJvZHkucG9zaXRpb24ueSxcclxuXHRcdFx0Ym9keS53aWR0aCxcclxuXHRcdFx0Ym9keS5oZWlnaHRcclxuXHRcdCk7XHJcblxyXG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcclxuXHRcdGN0eC5saW5lV2lkdGggPSAxO1xyXG5cdFx0Y3R4LnN0cm9rZSgpO1xyXG5cdFx0Y3R4LnRyYW5zbGF0ZSgtMC41LCAtMC41KTtcclxuXHR9XHJcblxyXG5cdHJlbmRlcigpIDogdm9pZCB7XHJcblx0XHR0aGlzLmNsZWFyKCk7XHJcblxyXG5cdFx0dGhpcy5yZW5kZXJUaWxlcygpO1xyXG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydidWxsZXQnXSwgdGhpcy5fZ2FtZS5idWxsZXRzKTtcclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snZW5lbXknXSwgdGhpcy5fZ2FtZS5lbmVtaWVzKTtcclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1sncGxheWVyJ10sIFt0aGlzLl9nYW1lLnBsYXllcl0pO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKGUgPT4ge1xyXG5cdFx0XHR0aGlzLnJlbmRlckhwQmFyKGUpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjbGVhcigpIDogdm9pZCB7XHJcblx0XHRsZXQgdyA9IHRoaXMuX2dhbWUuY2FudmFzLndpZHRoO1xyXG5cdFx0bGV0IGggPSB0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQ7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBVcGRhdGVyIHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYWxsRW50aXRpZXMoKSA6IEVudGl0eVtdIHtcclxuXHRcdHJldHVybiA8RW50aXR5W10+IEFycmF5LnByb3RvdHlwZS5jb25jYXQoXHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cyxcclxuXHRcdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLFxyXG5cdFx0XHR0aGlzLl9nYW1lLnBsYXllclxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9ucygpIDogdm9pZCB7XHJcblx0XHRsZXQgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaCgoZSk9PiB7IGUuY3VycmVudEFuaW1hdGlvbi51cGRhdGUodGhpcy5fZ2FtZS5nYW1lVGltZSk7IH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVFbnRpdGllcygpIDogdm9pZCB7XHJcblx0XHRsZXQgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaChlID0+IHsgZS51cGRhdGUoKTsgfSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZURlYWQoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmJ1bGxldHMpOyB9KVxyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmVuZW1pZXMpOyB9KVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW1vdmVEZWFkKGU6IEVudGl0eSwgY29sbGVjdGlvbjogRW50aXR5W10pIHtcclxuXHRcdGlmIChlLmFsaXZlID09PSBmYWxzZSkge1xyXG5cdFx0XHRsZXQgZUluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGUpO1xyXG5cclxuXHRcdFx0aWYgKGVJbmRleCA+IC0xKSB7XHJcblx0XHRcdFx0Y29sbGVjdGlvbi5zcGxpY2UoZUluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMudXBkYXRlQW5pbWF0aW9ucygpO1xyXG5cdFx0dGhpcy51cGRhdGVFbnRpdGllcygpO1xyXG5cdFx0dGhpcy51cGRhdGVEZWFkKCk7XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnRhcmdldCA9IHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb247XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jb2xsaXNpb25zLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5pbnB1dC51cGRhdGUoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9vcCgpIHt9O1xyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG5cdHN0YXRpYyBjbGFtcCh2YWx1ZSA6IG51bWJlciwgbWluIDogbnVtYmVyLCBtYXggOiBudW1iZXIpIDogbnVtYmVyIHtcclxuXHRcdGlmICh2YWx1ZSA+IG1heCkgeyByZXR1cm4gbWF4OyB9XHJcblx0XHRpZiAodmFsdWUgPCBtaW4pIHsgcmV0dXJuIG1pbjsgfVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcclxuXHJcbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XHJcblx0cHVibGljIHRhcmdldDogUG9pbnQ7XHJcblx0cHVibGljIHBvc2l0aW9uOiBQb2ludCA9IHsgeCA6IDAsIHkgOiAwIH07XHJcblxyXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XHJcblx0cHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcclxuXHRwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xyXG5cdFx0dGhpcy5faGVpZ2h0ID0gZ2FtZUluc3RhbmNlLmNhbnZhcy5oZWlnaHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhbGN1bGF0ZVBvc2l0aW9uKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMucG9zaXRpb24ueCA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueCAtIHRoaXMuX3dpZHRoIC8gMiwgMCwgdGhpcy5fZ2FtZS5tYXAud2lkdGggLSB0aGlzLl93aWR0aCk7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnkgPSBVdGlsLmNsYW1wKHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuXHR9XHJcbn0iXX0=
