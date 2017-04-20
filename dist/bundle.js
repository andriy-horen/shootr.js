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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JlbmRlcmVyLnRzIiwic3JjL2pzL3VwZGF0ZXIudHMiLCJzcmMvanMvdXRpbC50cyIsInNyYy9qcy92aWV3cG9ydC50cyIsInNyYy9qcy93YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0NBLE1BQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBRWpDO0lBbUJDLFlBQVksTUFBYyxFQUFFLEdBQVcsRUFBRSxLQUFZO1FBWjlDLFVBQUssR0FBWSxDQUFDLENBQUM7UUFNbkIsU0FBSSxHQUFZLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDNUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFXO1FBQ3JCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFP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M0MscUJBQWdCLEdBQWMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBS3BGLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU8sV0FBVyxDQUFDLFFBQWU7UUFDNUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FB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QUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFNUQsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsV0FB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QUcsQ0FBQyxDQUFDO1FBQ2xELHFCQUFnQixHQUFjLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUloRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0FBQ0wsQ0FBQztBQVJZLFlBQUksT0FRaEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0ICogYXMgQ29uc3QgZnJvbSAnLi9jb25zdCc7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuXHRwdWJsaWMgY3VycmVudEZyYW1lIDogRnJhbWU7XG5cblx0LyoqXG5cdCAqIE51bWJlciBvZiBmcmFtZXMgcGVyIHNlY29uZFxuXHQgKiBAdHlwZSB7bnVtYmVyfVxuXHQgKi9cblx0cHVibGljIHNwZWVkIDogbnVtYmVyID0gMDtcblx0LyoqXG5cdCAqIFRPRE86IEltcGxlbWVudCwgZmllbGQgaXMgbm90IHVzZWQgXG5cdCAqIFNldCB0byB0cnVlIHRvIG1ha2UgYW5pbWF0aW9uIGxvb3BlZCwgZmFsc2UgLSBmb3Igb25lIGN5Y2xlIG9ubHlcblx0ICogQHR5cGUge2Jvb2xlYW59XG5cdCAqL1xuXHRwdWJsaWMgbG9vcDogYm9vbGVhbiA9IHRydWU7XG5cblx0cHJpdmF0ZSBfbGFzdEFuaW1hdGVkIDogRGF0ZSA9IG5ldyBEYXRlKDApO1xuXHRwcml2YXRlIF9yb3cgOiBudW1iZXI7XG5cdHByaXZhdGUgX2xlbmd0aCA6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihsZW5ndGg6IG51bWJlciwgcm93OiBudW1iZXIsIGZyYW1lOiBGcmFtZSkge1xuXHRcdHRoaXMuX3JvdyA9IHJvdztcblx0XHR0aGlzLl9sZW5ndGggPSBsZW5ndGg7XG5cblx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IGZyYW1lO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLnkgPSB0aGlzLl9yb3cgKiB0aGlzLmN1cnJlbnRGcmFtZS5oZWlnaHQ7XG5cdH1cblxuXHRjYW5BbmltYXRlKHRpbWUgOiBEYXRlKSA6IGJvb2xlYW4ge1xuXHRcdGxldCBhbmltYXRpb25EZWx0YSA9IHRpbWUuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdEFuaW1hdGVkLmdldFRpbWUoKTtcblxuXHRcdHJldHVybiBhbmltYXRpb25EZWx0YSA+IHRoaXMuZGVsYXk7XG5cdH1cblxuXHRnZXQgZGVsYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gQ29uc3QuTVNfSU5fU0VDIC8gdGhpcy5zcGVlZDtcblx0fVxuXG5cdG5leHQoKTogdm9pZCB7XG5cdFx0bGV0IGluZGV4ID0gdGhpcy5jdXJyZW50RnJhbWUuaW5kZXg7XG5cblx0XHRpbmRleCA9IChpbmRleCArIDEpICUgdGhpcy5fbGVuZ3RoO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLmluZGV4ID0gaW5kZXg7XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IGluZGV4ICogdGhpcy5jdXJyZW50RnJhbWUud2lkdGg7XG5cdH1cblxuXHR1cGRhdGUoZ2FtZVRpbWU6IERhdGUpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5jYW5BbmltYXRlKGdhbWVUaW1lKSkge1xuXHRcdFx0dGhpcy5fbGFzdEFuaW1hdGVkID0gZ2FtZVRpbWU7XG5cblx0XHRcdHRoaXMubmV4dCgpO1xuXHRcdH1cblx0fVxuXG5cdHJlc2V0KCk6IHZvaWQge1xuXHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IG5ldyBEYXRlKDApO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLmluZGV4ID0gMDtcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS54ID0gMDtcblx0fVxufVxuIiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL3dvcmxkJztcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT25Db2xsaWRlIHtcblx0KG9iajogRW50aXR5IHwgV29ybGQpIDogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIEJvZHkge1xuXHRwb3NpdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xuXHR2ZWxvY2l0eTogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xuXHRvdmVybGFwOiBWZWN0b3IgPSAgbmV3IFZlY3RvcigpOyBcblx0c3BlZWQgOiBudW1iZXI7XG5cdHdpZHRoIDogbnVtYmVyO1xuXHRoZWlnaHQgOiBudW1iZXI7XG5cblx0b25Db2xsaWRlOiBPbkNvbGxpZGU7XG5cdGNvbGxpZGVXb3JsZEJvdW5kczogYm9vbGVhbiA9IHRydWU7XG5cblx0Y29uc3RydWN0b3IocG9zaXRpb246IFZlY3Rvciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cblx0Ly8gVE9ETzogTmVlZHMgdG8gYmUgaW1wcm92ZWQgYmVhY2F1c2UgbW9yZSBGUFMgcmVzdWx0cyBpbiBmYXN0ZXIgbW92ZW1lbnQ7XG5cdHByaXZhdGUgdXBkYXRlTW92ZW1lbnQoKTp2b2lkIHtcblx0XHR0aGlzLnBvc2l0aW9uID0gVmVjdG9yLmFkZCh0aGlzLnBvc2l0aW9uLCB0aGlzLnZlbG9jaXR5KTtcblxuXHRcdHRoaXMuc3BlZWQgPSBNYXRoLmh5cG90KHRoaXMudmVsb2NpdHkueCwgdGhpcy52ZWxvY2l0eS55KTtcblx0fVxuXG5cdHVwZGF0ZSgpIHtcblx0XHR0aGlzLnVwZGF0ZU1vdmVtZW50KCk7XG5cdH1cbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcblxuZXhwb3J0IGNsYXNzIEJ1bGxldCBleHRlbmRzIEVudGl0eSB7XG5cdHB1YmxpYyB0YXJnZXQgOiBQb2ludDtcblx0cHVibGljIHBhcmVudCA6IEVudGl0eTtcblx0cHVibGljIHNwZWVkIDogbnVtYmVyID0gMTA7XG5cdHB1YmxpYyBkYW1hZ2VBbW91bnQgOiBudW1iZXIgPSAxMDtcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcigpLCAzLCAzKTtcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDEwLCAxMCkpO1xuXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCwgdGFyZ2V0OiBQb2ludCwgcGFyZW50IDogRW50aXR5KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuYm9keS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG5cdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cblx0XHR0aGlzLnNldFZlbG9jaXR5KHRoaXMudGFyZ2V0KTtcblx0fVxuXG5cdHByaXZhdGUgc2V0VmVsb2NpdHkocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xuICAgICAgICBsZXQgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIGxldCBkaXJYID0gcG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54ID4gMCA/IDEgOiAtMTtcbiAgICAgICAgbGV0IGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xuXG4gICAgICAgIGxldCB4ID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xuICAgICAgICBsZXQgeSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcblxuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkgPSBuZXcgVmVjdG9yKHgsIHkpO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLmJvZHkudXBkYXRlKCk7XG5cdH1cbn1cbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgUGh5c2ljcyB9IGZyb20gJy4vcGh5c2ljcyc7XG5cbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25NYW5hZ2VyIHsgXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaCgoZW5lbXkpID0+IHtcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKChidWxsZXQpID0+IHtcblx0XHRcdFx0UGh5c2ljcy5jb2xsaWRlKGVuZW15LmJvZHksIGJ1bGxldC5ib2R5LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0ZW5lbXkuZGFtYWdlKGJ1bGxldC5kYW1hZ2VBbW91bnQsIGJ1bGxldC5wYXJlbnQpO1xuXG5cdFx0XHRcdFx0YnVsbGV0LmtpbGwoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxufSIsImV4cG9ydCBjb25zdCBNU19JTl9TRUMgPSAxMDAwO1xuIiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5cbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBFbmVteSBleHRlbmRzIEVudGl0eSB7XG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcblx0XHRcdCdpZGxlJyA6IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHRcdFx0J3JpZ2h0JyA6IG5ldyBBbmltYXRpb24oNCwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHRcdFx0J2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcbiAgICB9O1xuXG4gICAgcHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG4gICAgcHVibGljIHNwZWVkIDogbnVtYmVyID0gMztcbiAgICBwdWJsaWMgdGFyZ2V0IDogRW50aXR5O1xuICAgIHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoMTAwLCAxMDApLCAzNiwgMzYpO1xuXG5cdGNvbnN0cnVjdG9yKHRhcmdldDogRW50aXR5KSB7XG5cdFx0c3VwZXIoKTtcblxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcblxuXHRcdHRoaXMuYW5pbWF0ZSgncmlnaHQnKTtcblx0fVxuXG5cdGFuaW1hdGUoYW5pbWF0aW9uIDogc3RyaW5nKSA6IHZvaWQge1xuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24uc3BlZWQgPSAxMDtcblx0fVxuXG4gICAgLy8gVE9ETyA6IGludmVzdGlnYXRlIGlzc3VlIHdpdGggZGlhZ29uYWwgc3BlZWQuIH4yLjEyIHdoZW4gaXMgc3VwcG9zZWQgdG8gYmUgM1xuXHRtb3ZlVG93YXJkcyhwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XG4gICAgICAgIGxldCBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XG4gICAgICAgIGxldCBkeSA9IE1hdGguYWJzKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XG5cbiAgICAgICAgbGV0IGRpclggPSBNYXRoLnNpZ24ocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcbiAgICAgICAgbGV0IGRpclkgPSBNYXRoLnNpZ24ocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcblxuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XG5cbiAgICAgICAgaWYgKGRpclggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoJ2xlZnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYm9keS51cGRhdGUoKTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5tb3ZlVG93YXJkcyh0aGlzLnRhcmdldC5ib2R5LnBvc2l0aW9uKTtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiRW5lbXkgc3BlZWQ6IFwiICsgdGhpcy5ib2R5LnNwZWVkKTtcblx0fVxufVxuIiwiaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHkge1xuXHRwcml2YXRlIF9oZWFsdGggOiBudW1iZXIgPSAxMDA7XG5cdHByaXZhdGUgX2FsaXZlIDogYm9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2F0dGFja2VyIDogRW50aXR5O1xuXG5cdHB1YmxpYyBib2R5IDogQm9keTtcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG5cblx0Z2V0IGhlYWx0aCgpIDogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5faGVhbHRoO1xuXHR9XG5cblx0Z2V0IGFsaXZlKCkgOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fYWxpdmU7XG5cdH1cblxuXHRwcml2YXRlIF9zZXRIZWFsdGgobnVtYmVyOiBudW1iZXIpIHtcblx0XHRpZiAodGhpcy5faGVhbHRoID4gMCAmJiB0aGlzLl9hbGl2ZSkge1xuXHRcdFx0dGhpcy5faGVhbHRoICs9IG51bWJlcjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faGVhbHRoIDw9IDApIHtcblx0XHRcdHRoaXMua2lsbCgpO1xuXHRcdH1cblx0fVxuXG5cdGtpbGwoKSB7XG5cdFx0dGhpcy5faGVhbHRoID0gMDtcblx0XHR0aGlzLl9hbGl2ZSA9IGZhbHNlO1xuXHR9XG5cblx0ZGFtYWdlKGFtb3VudCA6IG51bWJlciwgYXR0YWNrZXI6IEVudGl0eSkgOiB2b2lkIHtcblx0XHR0aGlzLl9zZXRIZWFsdGgoLWFtb3VudCk7XG5cblx0XHR0aGlzLl9hdHRhY2tlciA9IGF0dGFja2VyO1xuXHR9XG5cblx0aGVhbChhbW91bnQgOiBudW1iZXIpIHtcblx0XHR0aGlzLl9zZXRIZWFsdGgoYW1vdW50KTtcblx0fVxuXG5cdHVwZGF0ZSgpIHt9XG59IiwiaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xuXG5leHBvcnQgY2xhc3MgRnJhbWUge1xuXHRpbmRleCA6IG51bWJlciA9IDA7XG5cdHg6IG51bWJlciA9IDA7XG5cdHk6IG51bWJlciA9IDA7XG5cdHdpZHRoOiBudW1iZXIgPSAwO1xuXHRoZWlnaHQ6IG51bWJlciA9IDA7XG5cdG5hbWUgOiBzdHJpbmc7XG5cblx0c3RhdGljIGNyZWF0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBGcmFtZSB7XG5cdFx0bGV0IGZyYW1lID0gbmV3IEZyYW1lKCk7XG5cblx0XHRmcmFtZS54ID0geDtcblx0XHRmcmFtZS55ID0geTtcblx0XHRmcmFtZS53aWR0aCA9IHdpZHRoO1xuXHRcdGZyYW1lLmhlaWdodCA9IGhlaWdodDtcblx0XHRmcmFtZS5uYW1lID0gbmFtZTtcblxuXHRcdHJldHVybiBmcmFtZTtcblx0fVxufVxuIiwiaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xuaW1wb3J0IHsgQ29sbGlzaW9uTWFuYWdlciB9IGZyb20gJy4vY29sbGlzaW9uLW1hbmFnZXInO1xuaW1wb3J0IHsgRW5lbXkgfSBmcm9tICcuL2VuZW15JztcbmltcG9ydCB7IFdhbGwgfSBmcm9tICcuL3dhbGwnO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuL2lucHV0JztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJy4vcGxheWVyJztcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IFJlbmRlcmVyIH0gZnJvbSAnLi9yZW5kZXJlcic7XG5pbXBvcnQgeyBVcGRhdGVyIH0gZnJvbSAnLi91cGRhdGVyJzsgXG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gJy4vdmlld3BvcnQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG5cdGNvbnRhaW5lciA6IHN0cmluZztcblx0c2hvd0FBQkIgOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG5cdHB1YmxpYyBjb25maWcgOiBDb25maWc7XG5cdHB1YmxpYyBjYW52YXMgOiBIVE1MQ2FudmFzRWxlbWVudDtcblx0cHVibGljIGNvbnRleHQgOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cdHB1YmxpYyBpc1J1bm5pbmcgPSBmYWxzZTtcblx0cHVibGljIHBsYXllcjogUGxheWVyO1xuXHRwdWJsaWMgYnVsbGV0czogQnVsbGV0W10gPSBbXTtcblx0cHVibGljIGVuZW1pZXM6IEVuZW15W10gPSBbXTtcblx0cHVibGljIHdhbGxzOiBXYWxsW10gPSBbXTtcblxuXHRwdWJsaWMgZ2FtZVRpbWU6IERhdGU7XG5cblx0cHVibGljIG1hcDogTWFwO1xuXHRwdWJsaWMgaW5wdXQ6IElucHV0O1xuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xuXHRwdWJsaWMgcmVuZGVyZXI6IFJlbmRlcmVyO1xuXHRwdWJsaWMgdXBkYXRlcjogVXBkYXRlcjtcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XG5cdHB1YmxpYyBtb3VzZTogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcblx0LyoqXG5cdCAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSB1bmlxdWUgSUQ7IHVzZWQgdG8gY2FuY2VsIFJBRi1sb29wXG5cdCAqIEB0eXBlIHtudW1iZXJ9XG5cdCAqL1xuXHRwcml2YXRlIF9yYWZJZCA6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihjb25maWc6IENvbmZpZykge1xuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xuXHRcdHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5jb250YWluZXIpO1xuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIodGhpcyk7XG5cdFx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XG5cdFx0dGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzKTtcblx0XHR0aGlzLnZpZXdwb3J0ID0gbmV3IFZpZXdwb3J0KHRoaXMpO1xuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIodGhpcyk7XG5cdFx0dGhpcy51cGRhdGVyID0gbmV3IFVwZGF0ZXIodGhpcyk7XG5cdFx0dGhpcy5jb2xsaXNpb25zID0gbmV3IENvbGxpc2lvbk1hbmFnZXIodGhpcyk7XG5cdFx0dGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMucGxheWVyKSk7XG5cdFx0dGhpcy53YWxscy5wdXNoKG5ldyBXYWxsKHsgeDogMzUwLCB5OiAyMCB9KSk7XG5cdH1cblxuXHR0aWNrKCkgOiB2b2lkIHtcblx0XHR0aGlzLmdhbWVUaW1lID0gbmV3IERhdGUoKTtcblxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xuXHRcdFx0dGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcblx0XHRcdHRoaXMudXBkYXRlci51cGRhdGUoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnRpY2suYmluZCh0aGlzKSk7XG5cdH1cblxuXHRydW4oKSA6IHZvaWQge1xuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcblx0XHRcdHRoaXMudGljaygpO1xuXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0c3RvcCgpIDogdm9pZCB7XG5cdFx0aWYgKHRoaXMuaXNSdW5uaW5nKSB7XG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XG5cblx0XHRcdHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG59XG5cbmxldCBnYW1lID0gbmV3IEdhbWUoe1xuXHRjb250YWluZXI6ICcuZ2FtZScsXG5cdHNob3dBQUJCOiBmYWxzZVxufSk7XG5cbmdhbWUucnVuKCk7IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBHZW5lcmljTWFwIGFzIE1hcCB9IGZyb20gJy4vY29sbGVjdGlvbnMnO1xuXG5leHBvcnQgZW51bSBBY3Rpb24geyBcblx0VXAsIFxuXHREb3duLFxuXHRMZWZ0LFxuXHRSaWdodCxcblx0QXR0YWNrXG59XG5cbmVudW0gS2V5IHtcblx0VyA9IDg3LFxuXHRBID0gNjUsXG5cdFMgPSA4Myxcblx0RCA9IDY4LFxuXHRVcCA9IDM4LFxuXHREb3duID0gNDAsXG5cdExlZnQgPSAzNyxcblx0UmlnaHQgPSAzOVxufVxuXG5leHBvcnQgY2xhc3MgSW5wdXQge1xuXHRwcml2YXRlIF9iaW5kaW5ncyA6IE1hcDxBY3Rpb24+ID0ge1xuXHRcdFtLZXkuV10gOiBBY3Rpb24uVXAsXG5cdFx0W0tleS5BXSA6IEFjdGlvbi5MZWZ0LFxuXHRcdFtLZXkuU10gOiBBY3Rpb24uRG93bixcblx0XHRbS2V5LkRdIDogQWN0aW9uLlJpZ2h0LFxuXHRcdFtLZXkuVXBdIDogQWN0aW9uLlVwLFxuXHRcdFtLZXkuRG93bl0gOiBBY3Rpb24uRG93bixcblx0XHRbS2V5LkxlZnRdIDogQWN0aW9uLkxlZnQsXG5cdFx0W0tleS5SaWdodF0gOiBBY3Rpb24uUmlnaHRcblx0fTtcblxuXHRwdWJsaWMgYWN0aW9ucyA6IE1hcDxib29sZWFuPiA9IHt9O1xuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcblx0cHJpdmF0ZSBfbW91c2VQb3M6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XG5cblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcC5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmdldE1vdXNlUG9zaXRpb24uYmluZCh0aGlzKSk7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24uYmluZCh0aGlzKSk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLm9uS2V5VXAuYmluZCh0aGlzKSk7XG5cdH1cblxuXHRiaW5kKGtleTogS2V5LCBhY3Rpb246IEFjdGlvbikge1xuXHRcdHRoaXMudW5iaW5kKGtleSk7XG5cblx0XHR0aGlzLl9iaW5kaW5nc1trZXldID0gYWN0aW9uO1xuXHR9XG5cblx0dW5iaW5kKGtleTogS2V5KSB7XG5cdFx0aWYgKHRoaXMuX2JpbmRpbmdzW2tleV0pIHtcblx0XHRcdGRlbGV0ZSB0aGlzLl9iaW5kaW5nc1trZXldO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpIHsgXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xuXG5cdFx0aWYgKGFjdGlvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IHRydWU7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uS2V5VXAoZTogS2V5Ym9hcmRFdmVudCkge1xuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcblxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSBmYWxzZTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZTogTW91c2VFdmVudCkge1xuXHRcdGNvbnN0IGxlZnRCdXR0b24gPSAwO1xuXG5cdFx0dGhpcy5nZXRNb3VzZVBvc2l0aW9uKGUpO1xuXHRcdGlmIChlLmJ1dHRvbiA9PSBsZWZ0QnV0dG9uKSB7XG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSB0cnVlO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBvbk1vdXNlVXAoZTogTW91c2VFdmVudCkge1xuXHRcdGNvbnN0IGxlZnRCdXR0b24gPSAwO1xuXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcblx0XHRcdHRoaXMuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSA9IGZhbHNlO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVE9ETyA6IE5lZWRzIGJldHRlciBpbXBsZW1lbnRhdGlvblxuXHRwcml2YXRlIGdldE1vdXNlUG9zaXRpb24oZTogTW91c2VFdmVudCkgeyBcblx0XHRsZXQgY2FudmFzT2Zmc2V0ID0gdGhpcy5fZ2FtZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHR0aGlzLl9tb3VzZVBvcyA9IHtcblx0ICAgICAgeDogZS5jbGllbnRYIC0gY2FudmFzT2Zmc2V0LmxlZnQsXG5cdCAgICAgIHk6IGUuY2xpZW50WSAtIGNhbnZhc09mZnNldC50b3Bcblx0ICAgIH07XG5cblx0ICAgXHR0aGlzLl9nYW1lLm1vdXNlID0ge1xuXHRcdFx0eDogdGhpcy5fbW91c2VQb3MueCArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgdXBkYXRlKCkge1xuXHRcdHRoaXMuX2dhbWUubW91c2UgPSB7XG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxuXHRcdFx0eTogdGhpcy5fbW91c2VQb3MueSArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueVxuXHRcdH1cblx0fVxufSIsImV4cG9ydCBjbGFzcyBNYXAgeyBcblx0cHVibGljIHdpZHRoIDogbnVtYmVyID0gMjAwMDtcblx0cHVibGljIGhlaWdodCA6IG51bWJlciA9IDE1MDA7XG59IiwiaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5cblxuZXhwb3J0IGNsYXNzIFBoeXNpY3Mge1xuXHQgLyoqXG4gICAgICogQ2hlY2tzIGlmIHR3byByZWN0YW5ndWxhciBib2RpZXMgaW50ZXJzZWN0XG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTEgRmlyc3QgYm9keSB3aXRoIHt4LHl9IHBvc2l0aW9uIGFuZCB7d2lkdGgsIGhlaWdodH1cbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MiBTZWNvbmQgYm9keVxuICAgICAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhleSBpbnRlcnNlY3QsIG90aGVyd2lzZSBmYWxzZVxuICAgICAqL1xuICAgIHN0YXRpYyBpbnRlcnNlY3RzKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSkgOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblggPSBib2R5MS5wb3NpdGlvbi54IDwgYm9keTIucG9zaXRpb24ueCArIGJvZHkyLndpZHRoIFxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi54ICsgYm9keTEud2lkdGggPiBib2R5Mi5wb3NpdGlvbi54O1xuICAgICAgICBcbiAgICAgICAgbGV0IGludGVyc2VjdGlvblkgPSBib2R5MS5wb3NpdGlvbi55IDwgYm9keTIucG9zaXRpb24ueSArIGJvZHkyLmhlaWdodCBcbiAgICAgICAgXHRcdFx0XHQgJiYgYm9keTEucG9zaXRpb24ueSArIGJvZHkxLmhlaWdodCA+IGJvZHkyLnBvc2l0aW9uLnk7XG5cbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblggJiYgaW50ZXJzZWN0aW9uWTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29sbGlkZShib2R5MTogQm9keSwgYm9keTI6IEJvZHksIGNvbGxpc2lvbkNhbGxiYWNrOiBGdW5jdGlvbikgOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhib2R5MSwgYm9keTIpKSB7XG4gICAgICAgICAgICBjb2xsaXNpb25DYWxsYmFjaygpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL2lucHV0JztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFBsYXllciBleHRlbmRzIEVudGl0eSB7XG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcblxuXHRwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKDEwLCAxMCksIDM2LCAzNik7XG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMztcblx0cHVibGljIGF0dGFja1NwZWVkID0gMTUwO1xuXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XG5cdCAgICAnaWRsZScgOiBuZXcgQW5pbWF0aW9uKDEsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcblx0ICAgICdsZWZ0JyA6IG5ldyBBbmltYXRpb24oNCwgMSwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpXG5cdH07XG5cdHByaXZhdGUgX2J1bGxldE9mZnNldCA6IFBvaW50ID0geyB4OiAxMiwgeTogMTggfTtcblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcblxuICAgICAgICB0aGlzLmFuaW1hdGUoJ2lkbGUnKTtcblx0fVxuXG5cdHNob290KCkgOiB2b2lkIHtcblx0XHRpZiAodGhpcy5jYW5TaG9vdCgpKSB7XG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XG5cdFx0XHRsZXQgYnVsbGV0U3Bhd24gPSBPYmplY3QuYXNzaWduKHt9LCB7IFxuXHRcdFx0XHR4OiB0aGlzLmJvZHkucG9zaXRpb24ueCArIHRoaXMuX2J1bGxldE9mZnNldC54LCBcblx0XHRcdFx0eTogdGhpcy5ib2R5LnBvc2l0aW9uLnkgKyB0aGlzLl9idWxsZXRPZmZzZXQueSBcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRTcGF3biwgdGhpcy5fZ2FtZS5tb3VzZSwgdGhpcyk7XG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMucHVzaChidWxsZXQpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY2FuU2hvb3QoKSA6IGJvb2xlYW4ge1xuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XG5cblx0XHRyZXR1cm4gZGlmZiA+IHRoaXMuYXR0YWNrU3BlZWQ7XG5cdH1cblxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24uc3BlZWQgPSAxMDtcblx0fVxuXG5cdHByaXZhdGUgdXBhdGVNb3ZlbWVudCgpIDogdm9pZCB7XG5cdFx0bGV0IGlucHV0ID0gdGhpcy5fZ2FtZS5pbnB1dDtcblxuXHRcdGxldCBtb3ZpbmdYID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0gfHwgaW5wdXQuYWN0aW9uc1tBY3Rpb24uUmlnaHRdO1xuXHRcdGxldCBtb3ZpbmdZID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uVXBdIHx8IGlucHV0LmFjdGlvbnNbQWN0aW9uLkRvd25dO1xuXG5cdFx0bGV0IHNwZWVkID0gbW92aW5nWCAmJiBtb3ZpbmdZID8gTWF0aC5zcXJ0KHRoaXMuc3BlZWQgKiB0aGlzLnNwZWVkIC8gMikgOiB0aGlzLnNwZWVkO1xuXG5cdFx0bGV0IGRpcmVjdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigpO1xuXG5cdFx0ZGlyZWN0aW9uLnggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSAgPyAtMSA6IDEsXG5cdFx0ZGlyZWN0aW9uLnkgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gPyAtMSA6IDFcblxuXHRcdGRpcmVjdGlvbi54ID0gbW92aW5nWCA/IGRpcmVjdGlvbi54IDogMDtcblx0XHRkaXJlY3Rpb24ueSA9IG1vdmluZ1kgPyBkaXJlY3Rpb24ueSA6IDA7XG5cblx0XHR0aGlzLmJvZHkudmVsb2NpdHkueCA9IGRpcmVjdGlvbi54ICogc3BlZWQ7XG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIHNwZWVkO1xuXG5cdFx0Y29uc29sZS5sb2coXCJQbGF5ZXIgc3BlZWQ6IFwiICsgdGhpcy5ib2R5LnNwZWVkKTtcblxuXHRcdHRoaXMuYm9keS51cGRhdGUoKTtcblxuXHRcdGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdKSB7XG5cdCAgICAgICAgdGhpcy5zaG9vdCgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9uKCkge1xuXHRcdGxldCBhbmltYXRpb24gPSB0aGlzLl9nYW1lLm1vdXNlLnggPiB0aGlzLmJvZHkucG9zaXRpb24ueCA/ICdyaWdodCcgOiAnbGVmdCc7XG5cblx0XHR0aGlzLmFuaW1hdGUoYW5pbWF0aW9uKTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy51cGF0ZU1vdmVtZW50KCk7XG5cdFx0dGhpcy51cGRhdGVBbmltYXRpb24oKTtcblx0fVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG5cdHggOiBudW1iZXI7XG5cdHkgOiBudW1iZXI7XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBSZWN0IHsgXG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFZlY3RvciB7XG5cdHggOiBudW1iZXIgPSAwO1xuXHR5IDogbnVtYmVyID0gMDtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwKSB7XG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXHR9XG5cblx0cHVibGljIHNldCh2YWx1ZTogbnVtYmVyIHwgVmVjdG9yKTogdm9pZCB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0dGhpcy54ID0gdGhpcy55ID0gdmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMueCA9IHZhbHVlLng7XG5cdFx0XHR0aGlzLnkgPSB2YWx1ZS55O1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBjbG9uZSgpOiBWZWN0b3Ige1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KTtcblx0fVxuXG5cdHB1YmxpYyBtYWduaXR1ZGUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSk7XG5cdH1cblxuXHRzdGF0aWMgYWRkKHZlYzE6IFZlY3RvciwgdmVjMjogVmVjdG9yKTogVmVjdG9yIHtcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih2ZWMxLnggKyB2ZWMyLngsIHZlYzEueSArIHZlYzIueSk7XG5cdH1cblxuXHRzdGF0aWMgc3VidHJhY3QodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYzEueCAtIHZlYzIueCwgdmVjMS55IC0gdmVjMi55KTtcblx0fVxuXG5cdHN0YXRpYyBtdWx0aXBseSh2ZWM6IFZlY3Rvciwgc2NhbGFyOiBudW1iZXIpIHtcblx0XHRyZXR1cm4gbmV3IFZlY3Rvcih2ZWMueCAqIHNjYWxhciwgdmVjLnkgKiBzY2FsYXIpO1xuXHR9XG5cblx0c3RhdGljIGZyb20ocG9pbnQ6IFBvaW50KSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IocG9pbnQueCwgcG9pbnQueSk7XG5cdH1cbn0iLCJpbXBvcnQgeyBHYW1lLCBDb25maWcgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXG5cdHByaXZhdGUgX3RpbGUgPSB7XG5cdFx0d2lkdGggOiAzMCxcblx0XHRoZWlnaHQ6IDMwXG5cdH1cblxuXG5cdC8qKlxuXHQgKlx0U3ByaXRlcyBJIHVzZSBmb3IgYSBkZXZlbG9wbWVudCB3ZXJlIGNyZWF0ZWQgYnkgQ29keSBTaGVwcCBmb3IgaGlzIGdhbWUgRGVudGFsIERlZmVuZGVyOiBTYWdhIG9mIHRoZSBDYW5keSBIb3JkZS5cblx0ICpcdFBsZWFzZSBjaGVjayBoaXMgZ2l0aHViIHJlcG86IGh0dHBzOi8vZ2l0aHViLmNvbS9jc2hlcHAvY2FuZHlqYW0vXG5cdCAqL1xuXHRwcml2YXRlIF9yZXNvdXJjZXMgPSB7XG5cdFx0J3BsYXllcicgOiAnLi9pbWcvcGxheWVyLnBuZycsXG5cdFx0J2VuZW15JyA6ICcuL2ltZy9lbmVteS5wbmcnLFxuXHRcdCdidWxsZXQnIDogJy4vaW1nL2J1bGxldC5wbmcnLFxuXHRcdCd3YWxsJzogJy4vaW1nL3RyZWUtcmVkLTEucG5nJ1xuXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUaWxlKHBvczogUG9pbnQsIGNvbG9yOiBzdHJpbmcpIDogdm9pZCB7XG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LnJlY3QocG9zLngsIHBvcy55LCB0aGlzLl90aWxlLndpZHRoLCB0aGlzLl90aWxlLmhlaWdodCk7XG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGwoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclRpbGVzKCkgOiB2b2lkIHtcbiAgICAgICAgbGV0IGNvbG9ycyA9IFtcIiM3ODVjOThcIiwgXCIjNjk0Zjg4XCJdO1xuXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5fZ2FtZS5tYXAud2lkdGg7IHggKz0gdGhpcy5fdGlsZS53aWR0aCkge1xuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQ7IHkgKz0gdGhpcy5fdGlsZS5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBsZXQgeEluZGV4ID0gKHggLyB0aGlzLl90aWxlLndpZHRoKSAlIDI7XG4gICAgICAgICAgICAgICAgbGV0IHlJbmRleCA9ICh5IC8gdGhpcy5fdGlsZS5oZWlnaHQpICUgMjtcblxuICAgICAgICAgICAgICAgIGxldCB0aWxlUG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoe3gsIHl9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlUG9zLCBjb2xvcnNbeEluZGV4IF4geUluZGV4XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbWVyYU9mZnNldChwb3M6IFBvaW50KSA6IFBvaW50IHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IHBvcy55IC0gc2VsZi5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XG4gICAgICAgIH07XG4gICAgfVxuXG5cdHByaXZhdGUgcmVuZGVySGVscGVyKHNvdXJjZSA6IHN0cmluZywgY29sbGVjdGlvbiA6IEVudGl0eVtdKSB7XG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXHRcdGltZy5zcmMgPSBzb3VyY2U7XG5cblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHtcblx0XHRcdGxldCBmcmFtZSA9IGUuY3VycmVudEFuaW1hdGlvbi5jdXJyZW50RnJhbWU7XG5cdFx0XHRsZXQgcG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoZS5ib2R5LnBvc2l0aW9uKTtcblxuXHRcdFx0aWYgKHRoaXMuX2dhbWUuY29uZmlnLnNob3dBQUJCKSB7XG5cdFx0XHRcdHRoaXMucmVuZGVyQUFCQihuZXcgQm9keShuZXcgVmVjdG9yKHBvcy54LCBwb3MueSksIGUuYm9keS53aWR0aCwgZS5ib2R5LmhlaWdodCkpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9nYW1lLmNvbnRleHQuZHJhd0ltYWdlKFxuXHRcdFx0XHRpbWcsXG5cdFx0XHRcdGZyYW1lLngsIGZyYW1lLnksXG5cdFx0XHRcdGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHQsXG5cdFx0XHRcdHBvcy54LCBwb3MueSxcblx0XHRcdFx0ZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodFxuXHRcdFx0KTtcblxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJIcEJhcihlOiBFbnRpdHkpIHtcblx0XHRsZXQgYmFyU2l6ZSA9IHsgd2lkdGg6IDUwLCBoZWlnaHQ6IDUgfTtcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xuXHRcdGxldCBwb3MgPSB0aGlzLmNhbWVyYU9mZnNldChWZWN0b3Iuc3VidHJhY3QoZS5ib2R5LnBvc2l0aW9uLCBuZXcgVmVjdG9yKDUsIDE1KSkpO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5yZWN0KFxuXHRcdFx0cG9zLngsXG5cdFx0XHRwb3MueSxcblx0XHRcdGJhclNpemUud2lkdGgsXG5cdFx0XHRiYXJTaXplLmhlaWdodFxuXHRcdCk7XG5cblx0XHR2YXIgZ3JkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KHBvcy54LCBwb3MueSwgcG9zLnggKyBiYXJTaXplLndpZHRoLCBwb3MueSArIGJhclNpemUuaGVpZ2h0KTtcblx0XHRncmQuYWRkQ29sb3JTdG9wKDAsIFwicmVkXCIpO1xuXHRcdGdyZC5hZGRDb2xvclN0b3AoZS5oZWFsdGggLyAxMDAsIFwicmVkXCIpO1xuXHRcdGdyZC5hZGRDb2xvclN0b3AoZS5oZWFsdGggLyAxMDAsIFwiYmxhY2tcIik7XG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgxLCBcImJsYWNrXCIpO1xuXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGdyZDtcblx0XHRjdHguZmlsbCgpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJBQUJCKGJvZHk6IEJvZHkpIHtcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC50cmFuc2xhdGUoMC41LCAwLjUpO1xuXHRcdGN0eC5yZWN0KFxuXHRcdFx0Ym9keS5wb3NpdGlvbi54LFxuXHRcdFx0Ym9keS5wb3NpdGlvbi55LFxuXHRcdFx0Ym9keS53aWR0aCxcblx0XHRcdGJvZHkuaGVpZ2h0XG5cdFx0KTtcblxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC50cmFuc2xhdGUoLTAuNSwgLTAuNSk7XG5cdH1cblxuXHRyZW5kZXIoKSA6IHZvaWQge1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHRoaXMucmVuZGVyVGlsZXMoKTtcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2J1bGxldCddLCB0aGlzLl9nYW1lLmJ1bGxldHMpO1xuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snZW5lbXknXSwgdGhpcy5fZ2FtZS5lbmVtaWVzKTtcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaChlID0+IHtcblx0XHRcdHRoaXMucmVuZGVySHBCYXIoZSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ3BsYXllciddLCBbdGhpcy5fZ2FtZS5wbGF5ZXJdKTtcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ3dhbGwnXSwgdGhpcy5fZ2FtZS53YWxscyk7XG5cdH1cblxuXHRjbGVhcigpIDogdm9pZCB7XG5cdFx0bGV0IHcgPSB0aGlzLl9nYW1lLmNhbnZhcy53aWR0aDtcblx0XHRsZXQgaCA9IHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodDtcblxuXHRcdHRoaXMuX2dhbWUuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XG5cdH1cbn1cbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlciB7XG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXHR9XG5cblx0cHJpdmF0ZSBhbGxFbnRpdGllcygpIDogRW50aXR5W10ge1xuXHRcdHJldHVybiA8RW50aXR5W10+IEFycmF5LnByb3RvdHlwZS5jb25jYXQoXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMsXG5cdFx0XHR0aGlzLl9nYW1lLmVuZW1pZXMsXG5cdFx0XHR0aGlzLl9nYW1lLnBsYXllclxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUFuaW1hdGlvbnMoKSA6IHZvaWQge1xuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcblxuXHRcdGVudGl0aWVzLmZvckVhY2goKGUpPT4geyBlLmN1cnJlbnRBbmltYXRpb24udXBkYXRlKHRoaXMuX2dhbWUuZ2FtZVRpbWUpOyB9KTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRW50aXRpZXMoKSA6IHZvaWQge1xuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcblxuXHRcdGVudGl0aWVzLmZvckVhY2goZSA9PiB7IGUudXBkYXRlKCk7IH0pO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVEZWFkKCkgOiB2b2lkIHtcblx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuYnVsbGV0cyk7IH0pXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmVuZW1pZXMpOyB9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVEZWFkKGU6IEVudGl0eSwgY29sbGVjdGlvbjogRW50aXR5W10pIHtcblx0XHRpZiAoZS5hbGl2ZSA9PT0gZmFsc2UpIHtcblx0XHRcdGxldCBlSW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoZSk7XG5cblx0XHRcdGlmIChlSW5kZXggPiAtMSkge1xuXHRcdFx0XHRjb2xsZWN0aW9uLnNwbGljZShlSW5kZXgsIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy51cGRhdGVBbmltYXRpb25zKCk7XG5cdFx0dGhpcy51cGRhdGVFbnRpdGllcygpO1xuXHRcdHRoaXMudXBkYXRlRGVhZCgpO1xuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudGFyZ2V0ID0gdGhpcy5fZ2FtZS5wbGF5ZXIuYm9keS5wb3NpdGlvbjtcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnVwZGF0ZSgpO1xuXHRcdHRoaXMuX2dhbWUuY29sbGlzaW9ucy51cGRhdGUoKTtcblx0XHR0aGlzLl9nYW1lLmlucHV0LnVwZGF0ZSgpO1xuXHR9XG59IiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbm9vcCgpIHt9O1xuXG5leHBvcnQgY2xhc3MgVXRpbCB7XG5cdHN0YXRpYyBjbGFtcCh2YWx1ZSA6IG51bWJlciwgbWluIDogbnVtYmVyLCBtYXggOiBudW1iZXIpIDogbnVtYmVyIHtcblx0XHRpZiAodmFsdWUgPiBtYXgpIHsgcmV0dXJuIG1heDsgfVxuXHRcdGlmICh2YWx1ZSA8IG1pbikgeyByZXR1cm4gbWluOyB9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cbn1cbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdHB1YmxpYyB0YXJnZXQ6IFBvaW50O1xuXHRwdWJsaWMgcG9zaXRpb246IFBvaW50ID0geyB4IDogMCwgeSA6IDAgfTtcblxuXHRwcml2YXRlIF9nYW1lOiBHYW1lO1xuXHRwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuXHRwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXHRcdHRoaXMuX3dpZHRoID0gZ2FtZUluc3RhbmNlLmNhbnZhcy53aWR0aDtcblx0XHR0aGlzLl9oZWlnaHQgPSBnYW1lSW5zdGFuY2UuY2FudmFzLmhlaWdodDtcblx0fVxuXG5cdHByaXZhdGUgY2FsY3VsYXRlUG9zaXRpb24oKSA6IHZvaWQge1xuXHRcdHRoaXMucG9zaXRpb24ueCA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueCAtIHRoaXMuX3dpZHRoIC8gMiwgMCwgdGhpcy5fZ2FtZS5tYXAud2lkdGggLSB0aGlzLl93aWR0aCk7XG5cdFx0dGhpcy5wb3NpdGlvbi55ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC55IC0gdGhpcy5faGVpZ2h0IC8gMiwgMCwgdGhpcy5fZ2FtZS5tYXAuaGVpZ2h0IC0gdGhpcy5faGVpZ2h0KTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5jYWxjdWxhdGVQb3NpdGlvbigpO1xuXHR9XG59IiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBXYWxsIGV4dGVuZHMgRW50aXR5IHtcclxuICAgIHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoKSwgMTUxLCAyMTEpO1xyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uOiBBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKDEsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAxNTEsIDIxMSkpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ib2R5LnBvc2l0aW9uID0gVmVjdG9yLmZyb20ocG9zaXRpb24pO1xyXG4gICAgfVxyXG59Il19
