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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JlbmRlcmVyLnRzIiwic3JjL2pzL3VwZGF0ZXIudHMiLCJzcmMvanMvdXRpbC50cyIsInNyYy9qcy92aWV3cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNDQSxNQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUVqQztJQW1CQyxZQUFZLE1BQWMsRUFBRSxHQUFXLEVBQUUsS0FBWTtRQVo5QyxVQUFLLEdBQVksQ0FBQyxDQUFDO1FBTW5CLFNBQUksR0FBWSxJQUFJLENBQUM7UUFFcEIsa0JBQWEsR0FBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUsxQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQzVELENBQUM7SUFFRCxVQUFVLENBQUMsSUFBVztRQUNyQixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxD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QUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUtwRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVPLFdBQVcsQ0FBQyxRQUFlO1FBQzVCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUU3QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxNQUFNO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNwQixDQUFDO0FBQ0YsQ0FBQztBQWxDWSxjQUFNLFNBa0NsQixDQUFBOzs7QUN4Q0QsMEJBQXdCLFdBQVcsQ0FBQyxDQUFBO0FBRXBDO0lBR0MsWUFBWSxZQUFtQjtRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRUQsTUFBTTtRQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUs7WUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTTtnQkFDakMsaUJBQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO29CQUN4QyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUVqRCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztBQUNGLENBQUM7QUFsQlksd0JBQWdCLG1CQWtCNUIsQ0FBQTs7O0FDckJZLGlCQUFTLEdBQUcsSUFBSSxDQUFDOzs7QUNBOUIseUJBQXVCLFVBQVUsQ0FBQyxDQUFBO0FBRWxDLDZCQUE4QixjQUFjLENBQUMsQ0FBQTtBQUM3Qyx1QkFBcUIsUUFBUSxDQUFDLENBQUE7QUFHOUIsd0JBQXNCLFNBQVMsQ0FBQyxDQUFBO0FBQ2hDLDRCQUEwQixhQUFhLENBQUMsQ0FBQTtBQUV4QyxvQkFBMkIsZUFBTTtJQVloQyxZQUFZLE1BQWM7UUFDekIsT0FBTyxDQUFDO1FBWkQsZ0JBQVcsR0FBb0I7WUFDckMsTUFBTSxFQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsT0FBTyxFQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsTUFBTSxFQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdEQsQ0FBQztRQUdLLFVBQUssR0FBWSxDQUFDLENBQUM7UUFFbkIsU0FBSSxHQUFVLElBQUksV0FBSSxDQUFDLElBQUksbUJBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBS3hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRTNCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELE9BQU8sQ0FBQyxTQUFrQjtRQUN6QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBR0QsV0FBVyxDQUFDLFFBQWU7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXhELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTVELEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxNQUFNO1FBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUc3QyxDQUFDO0FBQ0YsQ0FBQztBQWxEWSxhQUFLLFFBa0RqQixDQUFBOzs7QUN4REQ7SUFBQTtRQUNTLFlBQU8sR0FBWSxHQUFHLENBQUM7UUFDdkIsV0FBTSxHQUFhLElBQUksQ0FBQztJQXdDakMsQ0FBQztJQWxDQSxJQUFJLE1BQU07UUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNyQixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQUVPLFVBQVUsQ0FBQyxNQUFjO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsQ0FBQztJQUNGLENBQUM7SUFFRCxJQUFJO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFlLEVBQUUsUUFBZ0I7UUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXpCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLENBQUMsTUFBZTtRQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLEtBQUksQ0FBQztBQUNaLENBQUM7QUExQ3FCLGNBQU0sU0EwQzNCLENBQUE7OztBQzNDRDtJQUFBO1FBQ0MsVUFBSyxHQUFZLENBQUMsQ0FBQztRQUNuQixNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztRQUNkLFVBQUssR0FBVyxDQUFDLENBQUM7UUFDbEIsV0FBTSxHQUFXLENBQUMsQ0FBQztJQWNwQixDQUFDO0lBWEEsT0FBTyxNQUFNLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhLEVBQUUsTUFBYztRQUNoRSxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBRXhCLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1osS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWixLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN0QixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNGLENBQUM7QUFuQlksYUFBSyxRQW1CakIsQ0FBQTs7O0FDcEJELG9DQUFpQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3ZELHdCQUFzQixTQUFTLENBQUMsQ0FBQTtBQUNoQyx3QkFBc0IsU0FBUyxDQUFDLENBQUE7QUFDaEMsc0JBQW9CLE9BQU8sQ0FBQyxDQUFBO0FBQzVCLHlCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUVsQywyQkFBeUIsWUFBWSxDQUFDLENBQUE7QUFDdEMsMEJBQXdCLFdBQVcsQ0FBQyxDQUFBO0FBQ3BDLDJCQUF5QixZQUFZLENBQUMsQ0FBQTtBQU90QztJQXdCQyxZQUFZLE1BQWM7UUFwQm5CLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFFbEIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixZQUFPLEdBQVksRUFBRSxDQUFDO1FBVXRCLFVBQUssR0FBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBUXBDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQXVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksU0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksb0NBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELElBQUk7UUFDSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFM0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELEdBQUc7UUFDRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRVosSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdkIsQ0FBQztJQUNGLENBQUM7SUFFRCxJQUFJO1FBQ0gsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLENBQUM7SUFDRixDQUFDO0FBQ0YsQ0FBQztBQWpFWSxZQUFJLE9BaUVoQixDQUFBO0FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUM7SUFDbkIsU0FBUyxFQUFFLE9BQU87SUFDbEIsUUFBUSxFQUFFLEtBQUs7Q0FDZixDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7OztBQ3BGWCxXQUFZLE1BQU07SUFDakIsK0JBQUUsQ0FBQTtJQUNGLG1DQUFJLENBQUE7SUFDSixtQ0FBSSxDQUFBO0lBQ0oscUNBQUssQ0FBQTtJQUNMLHVDQUFNLENBQUE7QUFDUCxDQUFDLEVBTlcsY0FBTSxLQUFOLGNBQU0sUUFNakI7QUFORCxJQUFZLE1BQU0sR0FBTixjQU1YLENBQUE7QUFFRCxJQUFLLEdBU0o7QUFURCxXQUFLLEdBQUc7SUFDUCx3QkFBTSxDQUFBO0lBQ04sd0JBQU0sQ0FBQTtJQUNOLHdCQUFNLENBQUE7SUFDTix3QkFBTSxDQUFBO0lBQ04sMEJBQU8sQ0FBQTtJQUNQLDhCQUFTLENBQUE7SUFDVCw4QkFBUyxDQUFBO0lBQ1QsZ0NBQVUsQ0FBQTtBQUNYLENBQUMsRUFUSSxHQUFHLEtBQUgsR0FBRyxRQVNQO0FBRUQ7SUFnQkMsWUFBWSxZQUFtQjtRQWZ2QixjQUFTLEdBQWlCO1lBQ2pDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxFQUFFO1lBQ25CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxJQUFJO1lBQ3JCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxJQUFJO1lBQ3JCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxLQUFLO1lBQ3RCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxFQUFFO1lBQ3BCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFHLE1BQU0sQ0FBQyxJQUFJO1lBQ3hCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFHLE1BQU0sQ0FBQyxJQUFJO1lBQ3hCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFHLE1BQU0sQ0FBQyxLQUFLO1NBQzFCLENBQUM7UUFFSyxZQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUUzQixjQUFTLEdBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUd6QyxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztRQUUxQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWxGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELElBQUksQ0FBQyxHQUFRLEVBQUUsTUFBYztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBUTtRQUNkLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0YsQ0FBQztJQUVPLFNBQVMsQ0FBQyxDQUFnQjtRQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVyQyxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUU1QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDcEIsQ0FBQztJQUNGLENBQUM7SUFFTyxPQUFPLENBQUMsQ0FBZ0I7UUFDL0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFckMsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7WUFFN0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BCLENBQUM7SUFDRixDQUFDO0lBRU8sV0FBVyxDQUFDLENBQWE7UUFDaEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRW5DLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixDQUFDO0lBQ0YsQ0FBQztJQUVPLFNBQVMsQ0FBQyxDQUFhO1FBQzlCLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQztRQUVyQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRXBDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixDQUFDO0lBQ0YsQ0FBQztJQUdPLGdCQUFnQixDQUFDLENBQWE7UUFDckMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUU3RCxJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ1osQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUk7WUFDaEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLEdBQUc7U0FDaEMsQ0FBQztRQUVGLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHO1lBQ3JCLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRCxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEQsQ0FBQTtJQUNGLENBQUM7SUFFTSxNQUFNO1FBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUc7WUFDbEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNwRCxDQUFBO0lBQ0YsQ0FBQztBQUNGLENBQUM7QUFyR1ksYUFBSyxRQXFHakIsQ0FBQTs7O0FDNUhEO0lBQUE7UUFDUSxVQUFLLEdBQVksSUFBSSxDQUFDO1FBQ3RCLFdBQU0sR0FBWSxJQUFJLENBQUM7SUFDL0IsQ0FBQztBQUFELENBQUM7QUFIWSxXQUFHLE1BR2YsQ0FBQTs7O0FDQUQ7SUFPSSxPQUFPLFVBQVUsQ0FBQyxLQUFXLEVBQUUsS0FBVztRQUN0QyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSztlQUM3RCxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNO2VBQzlELEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUM7SUFDMUMsQ0FBQztJQUVELE9BQU8sT0FBTyxDQUFDLEtBQVcsRUFBRSxLQUFXLEVBQUUsaUJBQTJCO1FBQ2hFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxpQkFBaUIsRUFBRSxDQUFDO1lBRXBCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUM7QUExQlksZUFBTyxVQTBCbkIsQ0FBQTs7O0FDNUJELHlCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUNsQyw2QkFBOEIsY0FBYyxDQUFDLENBQUE7QUFDN0Msd0JBQXVCLFNBQVMsQ0FBQyxDQUFBO0FBQ2pDLHVCQUFxQixRQUFRLENBQUMsQ0FBQTtBQUM5Qix5QkFBdUIsVUFBVSxDQUFDLENBQUE7QUFDbEMsd0JBQXNCLFNBQVMsQ0FBQyxDQUFBO0FBRWhDLDRCQUEwQixhQUFhLENBQUMsQ0FBQTtBQUl4QyxxQkFBNEIsZUFBTTtJQWdCakMsWUFBWSxZQUFrQjtRQUM3QixPQUFPLENBQUM7UUFmRCxjQUFTLEdBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEMsU0FBSSxHQUFVLElBQUksV0FBSSxDQUFDLElBQUksbUJBQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELFVBQUssR0FBVyxDQUFDLENBQUM7UUFDbEIsZ0JBQVcsR0FBRyxHQUFHLENBQUM7UUFHakIsZ0JBQVcsR0FBb0I7WUFDbkMsTUFBTSxFQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsT0FBTyxFQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsTUFBTSxFQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDM0QsQ0FBQztRQUNNLGtCQUFhLEdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUtoRCxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztRQUVwQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxLQUFLO1FBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDNUIsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7Z0JBQ25DLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUM5QyxDQUFDLENBQUM7WUFFSCxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDRixDQUFDO0lBRU8sUUFBUTtRQUNmLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFcEUsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxPQUFPLENBQUMsU0FBa0I7UUFDekIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVPLGFBQWE7UUFDcEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFFN0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEUsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFNLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckUsSUFBSSxLQUFLLEdBQUcsT0FBTyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRXJGLElBQUksU0FBUyxHQUFXLElBQUksbUJBQU0sRUFBRSxDQUFDO1FBRXJDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFNLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUNsRCxTQUFTLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUUvQyxTQUFTLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxTQUFTLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRTNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRW5CLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEIsQ0FBQztJQUNGLENBQUM7SUFFTyxlQUFlO1FBQ3RCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUU3RSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNO1FBQ0wsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN4QixDQUFDO0FBQ0YsQ0FBQztBQXRGWSxjQUFNLFNBc0ZsQixDQUFBOzs7QUNyRkQ7SUFJQyxZQUFZLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFXLENBQUM7UUFIeEMsTUFBQyxHQUFZLENBQUMsQ0FBQztRQUNmLE1BQUMsR0FBWSxDQUFDLENBQUM7UUFHZCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVNLEdBQUcsQ0FBQyxLQUFzQjtRQUNoQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDekIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQixDQUFDO0lBQ0YsQ0FBQztJQUVNLEtBQUs7UUFDWCxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLFNBQVM7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE9BQU8sR0FBRyxDQUFDLElBQVksRUFBRSxJQUFZO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE9BQU8sUUFBUSxDQUFDLElBQVksRUFBRSxJQUFZO1FBQ3pDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE9BQU8sUUFBUSxDQUFDLEdBQVcsRUFBRSxNQUFjO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELENBQUM7QUFDRixDQUFDO0FBckNZLGNBQU0sU0FxQ2xCLENBQUE7OztBQy9DRCw2QkFBOEIsY0FBYyxDQUFDLENBQUE7QUFFN0MsdUJBQXFCLFFBQVEsQ0FBQyxDQUFBO0FBRTlCO0lBbUJDLFlBQVksWUFBa0I7UUFoQnRCLFVBQUssR0FBRztZQUNmLEtBQUssRUFBRyxFQUFFO1lBQ1YsTUFBTSxFQUFFLEVBQUU7U0FDVixDQUFBO1FBT08sZUFBVSxHQUFHO1lBQ3BCLFFBQVEsRUFBRyxrQkFBa0I7WUFDN0IsT0FBTyxFQUFHLGlCQUFpQjtZQUMzQixRQUFRLEVBQUcsa0JBQWtCO1NBQzdCLENBQUE7UUFHQSxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRU8sVUFBVSxDQUFDLEdBQVUsRUFBRSxLQUFhO1FBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTyxXQUFXO1FBQ2YsSUFBSSxNQUFNLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFcEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDOUQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFekMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFDLEdBQUEsQ0FBQyxFQUFFLEdBQUEsQ0FBQyxFQUFDLENBQUMsQ0FBQztnQkFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxHQUFVO1FBQzNCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixNQUFNLENBQUM7WUFDSCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1QyxDQUFDO0lBQ04sQ0FBQztJQUVJLFlBQVksQ0FBQyxNQUFlLEVBQUUsVUFBcUI7UUFDMUQsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUVqQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1lBQzVDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU3QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksV0FBSSxDQUFDLElBQUksbUJBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEYsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FDM0IsR0FBRyxFQUNILEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFDaEIsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxFQUN6QixHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQ1osS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUN6QixDQUFDO1FBRUgsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU8sVUFBVSxDQUFDLElBQVU7UUFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFFN0IsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ2YsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsTUFBTSxDQUNYLENBQUM7UUFFRixHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDYixHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxLQUFLO1FBQ0osSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztBQUNGLENBQUM7QUE5R1ksZ0JBQVEsV0E4R3BCLENBQUE7OztBQ2xIRDtJQUdDLFlBQVksWUFBbUI7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVPLFdBQVc7UUFDbEIsTUFBTSxDQUFZLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUNqQixDQUFDO0lBQ0gsQ0FBQztJQUVPLGdCQUFnQjtRQUN2QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRU8sY0FBYztRQUNyQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLFVBQVU7UUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDNUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0UsQ0FBQztJQUVPLFVBQVUsQ0FBQyxDQUFTLEVBQUUsVUFBb0I7UUFDakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbkMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRUQsTUFBTTtRQUNMLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0IsQ0FBQztBQUNGLENBQUM7QUFuRFksZUFBTyxVQW1EbkIsQ0FBQTs7O0FDcERELGtCQUF3QixDQUFDO0FBQVQsWUFBSSxPQUFLLENBQUE7QUFBQSxDQUFDO0FBRTFCO0lBQ0MsT0FBTyxLQUFLLENBQUMsS0FBYyxFQUFFLEdBQVksRUFBRSxHQUFZO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQUMsQ0FBQztRQUVoQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNGLENBQUM7QUFQWSxZQUFJLE9BT2hCLENBQUE7OztBQ1JELHVCQUFxQixRQUFRLENBQUMsQ0FBQTtBQUU5QjtJQVFDLFlBQVksWUFBa0I7UUFOdkIsYUFBUSxHQUFVLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUM7UUFPekMsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzNDLENBQUM7SUFFTyxpQkFBaUI7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsV0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxXQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFFRCxNQUFNO1FBQ0wsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDMUIsQ0FBQztBQUNGLENBQUM7QUF0QlksZ0JBQVEsV0FzQnBCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcbmltcG9ydCAqIGFzIENvbnN0IGZyb20gJy4vY29uc3QnO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uIHtcblx0cHVibGljIGN1cnJlbnRGcmFtZSA6IEZyYW1lO1xuXG5cdC8qKlxuXHQgKiBOdW1iZXIgb2YgZnJhbWVzIHBlciBzZWNvbmRcblx0ICogQHR5cGUge251bWJlcn1cblx0ICovXG5cdHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDA7XG5cdC8qKlxuXHQgKiBUT0RPOiBJbXBsZW1lbnQsIGZpZWxkIGlzIG5vdCB1c2VkIFxuXHQgKiBTZXQgdG8gdHJ1ZSB0byBtYWtlIGFuaW1hdGlvbiBsb29wZWQsIGZhbHNlIC0gZm9yIG9uZSBjeWNsZSBvbmx5XG5cdCAqIEB0eXBlIHtib29sZWFufVxuXHQgKi9cblx0cHVibGljIGxvb3A6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdHByaXZhdGUgX2xhc3RBbmltYXRlZCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcblx0cHJpdmF0ZSBfcm93IDogbnVtYmVyO1xuXHRwcml2YXRlIF9sZW5ndGggOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IobGVuZ3RoOiBudW1iZXIsIHJvdzogbnVtYmVyLCBmcmFtZTogRnJhbWUpIHtcblx0XHR0aGlzLl9yb3cgPSByb3c7XG5cdFx0dGhpcy5fbGVuZ3RoID0gbGVuZ3RoO1xuXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS55ID0gdGhpcy5fcm93ICogdGhpcy5jdXJyZW50RnJhbWUuaGVpZ2h0O1xuXHR9XG5cblx0Y2FuQW5pbWF0ZSh0aW1lIDogRGF0ZSkgOiBib29sZWFuIHtcblx0XHRsZXQgYW5pbWF0aW9uRGVsdGEgPSB0aW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RBbmltYXRlZC5nZXRUaW1lKCk7XG5cblx0XHRyZXR1cm4gYW5pbWF0aW9uRGVsdGEgPiB0aGlzLmRlbGF5O1xuXHR9XG5cblx0Z2V0IGRlbGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIENvbnN0Lk1TX0lOX1NFQyAvIHRoaXMuc3BlZWQ7XG5cdH1cblxuXHRuZXh0KCk6IHZvaWQge1xuXHRcdGxldCBpbmRleCA9IHRoaXMuY3VycmVudEZyYW1lLmluZGV4O1xuXG5cdFx0aW5kZXggPSAoaW5kZXggKyAxKSAlIHRoaXMuX2xlbmd0aDtcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5pbmRleCA9IGluZGV4O1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLnggPSBpbmRleCAqIHRoaXMuY3VycmVudEZyYW1lLndpZHRoO1xuXHR9XG5cblx0dXBkYXRlKGdhbWVUaW1lOiBEYXRlKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuY2FuQW5pbWF0ZShnYW1lVGltZSkpIHtcblx0XHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IGdhbWVUaW1lO1xuXG5cdFx0XHR0aGlzLm5leHQoKTtcblx0XHR9XG5cdH1cblxuXHRyZXNldCgpOiB2b2lkIHtcblx0XHR0aGlzLl9sYXN0QW5pbWF0ZWQgPSBuZXcgRGF0ZSgwKTtcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5pbmRleCA9IDA7XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IDA7XG5cdH1cbn1cbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi93b3JsZCc7XG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9uQ29sbGlkZSB7XG5cdChvYmo6IEVudGl0eSB8IFdvcmxkKSA6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBCb2R5IHtcblx0cG9zaXRpb246IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcblx0dmVsb2NpdHk6IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcblx0b3ZlcmxhcDogVmVjdG9yID0gIG5ldyBWZWN0b3IoKTsgXG5cdHNwZWVkIDogbnVtYmVyO1xuXHR3aWR0aCA6IG51bWJlcjtcblx0aGVpZ2h0IDogbnVtYmVyO1xuXG5cdG9uQ29sbGlkZTogT25Db2xsaWRlO1xuXHRjb2xsaWRlV29ybGRCb3VuZHM6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdHRoaXMud2lkdGggPSB3aWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcblx0fVxuXG5cdC8vIFRPRE86IE5lZWRzIHRvIGJlIGltcHJvdmVkIGJlYWNhdXNlIG1vcmUgRlBTIHJlc3VsdHMgaW4gZmFzdGVyIG1vdmVtZW50O1xuXHRwcml2YXRlIHVwZGF0ZU1vdmVtZW50KCk6dm9pZCB7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IFZlY3Rvci5hZGQodGhpcy5wb3NpdGlvbiwgdGhpcy52ZWxvY2l0eSk7XG5cblx0XHR0aGlzLnNwZWVkID0gTWF0aC5oeXBvdCh0aGlzLnZlbG9jaXR5LngsIHRoaXMudmVsb2NpdHkueSk7XG5cdH1cblxuXHR1cGRhdGUoKSB7XG5cdFx0dGhpcy51cGRhdGVNb3ZlbWVudCgpO1xuXHR9XG59IiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XG5cbmV4cG9ydCBjbGFzcyBCdWxsZXQgZXh0ZW5kcyBFbnRpdHkge1xuXHRwdWJsaWMgdGFyZ2V0IDogUG9pbnQ7XG5cdHB1YmxpYyBwYXJlbnQgOiBFbnRpdHk7XG5cdHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDEwO1xuXHRwdWJsaWMgZGFtYWdlQW1vdW50IDogbnVtYmVyID0gMTA7XG5cdHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoKSwgMywgMyk7XG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uOiBBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKDEsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAxMCwgMTApKTtcblxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9pbnQsIHRhcmdldDogUG9pbnQsIHBhcmVudCA6IEVudGl0eSkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmJvZHkucG9zaXRpb24gPSBuZXcgVmVjdG9yKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXHRcdHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG5cdFx0dGhpcy5zZXRWZWxvY2l0eSh0aGlzLnRhcmdldCk7XG5cdH1cblxuXHRwcml2YXRlIHNldFZlbG9jaXR5KHBvc2l0aW9uOiBQb2ludCkgOiB2b2lkIHtcbiAgICAgICAgbGV0IGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcbiAgICAgICAgbGV0IGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcblxuICAgICAgICBsZXQgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XG4gICAgICAgIGxldCBkaXJZID0gcG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55ID4gMCA/IDEgOiAtMTtcblxuICAgICAgICBsZXQgeCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcbiAgICAgICAgbGV0IHkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XG5cbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih4LCB5KTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IFBoeXNpY3MgfSBmcm9tICcuL3BoeXNpY3MnO1xuXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uTWFuYWdlciB7IFxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaCgoYnVsbGV0KSA9PiB7XG5cdFx0XHRcdFBoeXNpY3MuY29sbGlkZShlbmVteS5ib2R5LCBidWxsZXQuYm9keSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGVuZW15LmRhbWFnZShidWxsZXQuZGFtYWdlQW1vdW50LCBidWxsZXQucGFyZW50KTtcblxuXHRcdFx0XHRcdGJ1bGxldC5raWxsKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cbn0iLCJleHBvcnQgY29uc3QgTVNfSU5fU0VDID0gMTAwMDtcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBFbnRpdHkge1xuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XG5cdFx0XHQnaWRsZScgOiBuZXcgQW5pbWF0aW9uKDEsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcblx0XHRcdCdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKDQsIDAsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcblx0XHRcdCdsZWZ0JyA6IG5ldyBBbmltYXRpb24oNCwgMSwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpXG4gICAgfTtcblxuICAgIHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xuICAgIHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDM7XG4gICAgcHVibGljIHRhcmdldCA6IEVudGl0eTtcbiAgICBwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKDEwMCwgMTAwKSwgMzYsIDM2KTtcblxuXHRjb25zdHJ1Y3Rvcih0YXJnZXQ6IEVudGl0eSkge1xuXHRcdHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XG5cdH1cblxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZykgOiB2b2lkIHtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25zW2FuaW1hdGlvbl07XG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTA7XG5cdH1cblxuICAgIC8vIFRPRE8gOiBpbnZlc3RpZ2F0ZSBpc3N1ZSB3aXRoIGRpYWdvbmFsIHNwZWVkLiB+Mi4xMiB3aGVuIGlzIHN1cHBvc2VkIHRvIGJlIDNcblx0bW92ZVRvd2FyZHMocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xuICAgICAgICBsZXQgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xuICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIGxldCBkaXJYID0gTWF0aC5zaWduKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XG4gICAgICAgIGxldCBkaXJZID0gTWF0aC5zaWduKHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSk7XG5cbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xuXG4gICAgICAgIGlmIChkaXJYID4gMCkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdsZWZ0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKCk7XG5cdH1cblxuXHR1cGRhdGUoKSA6IHZvaWQge1xuXHRcdHRoaXMubW92ZVRvd2FyZHModGhpcy50YXJnZXQuYm9keS5wb3NpdGlvbik7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkVuZW15IHNwZWVkOiBcIiArIHRoaXMuYm9keS5zcGVlZCk7XG5cdH1cbn1cbiIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5IHtcblx0cHJpdmF0ZSBfaGVhbHRoIDogbnVtYmVyID0gMTAwO1xuXHRwcml2YXRlIF9hbGl2ZSA6IGJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9hdHRhY2tlciA6IEVudGl0eTtcblxuXHRwdWJsaWMgYm9keSA6IEJvZHk7XG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xuXG5cdGdldCBoZWFsdGgoKSA6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2hlYWx0aDtcblx0fVxuXG5cdGdldCBhbGl2ZSgpIDogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2FsaXZlO1xuXHR9XG5cblx0cHJpdmF0ZSBfc2V0SGVhbHRoKG51bWJlcjogbnVtYmVyKSB7XG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA+IDAgJiYgdGhpcy5fYWxpdmUpIHtcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XG5cdFx0XHR0aGlzLmtpbGwoKTtcblx0XHR9XG5cdH1cblxuXHRraWxsKCkge1xuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XG5cdFx0dGhpcy5fYWxpdmUgPSBmYWxzZTtcblx0fVxuXG5cdGRhbWFnZShhbW91bnQgOiBudW1iZXIsIGF0dGFja2VyOiBFbnRpdHkpIDogdm9pZCB7XG5cdFx0dGhpcy5fc2V0SGVhbHRoKC1hbW91bnQpO1xuXG5cdFx0dGhpcy5fYXR0YWNrZXIgPSBhdHRhY2tlcjtcblx0fVxuXG5cdGhlYWwoYW1vdW50IDogbnVtYmVyKSB7XG5cdFx0dGhpcy5fc2V0SGVhbHRoKGFtb3VudCk7XG5cdH1cblxuXHR1cGRhdGUoKSB7fVxufSIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcblxuZXhwb3J0IGNsYXNzIEZyYW1lIHtcblx0aW5kZXggOiBudW1iZXIgPSAwO1xuXHR4OiBudW1iZXIgPSAwO1xuXHR5OiBudW1iZXIgPSAwO1xuXHR3aWR0aDogbnVtYmVyID0gMDtcblx0aGVpZ2h0OiBudW1iZXIgPSAwO1xuXHRuYW1lIDogc3RyaW5nO1xuXG5cdHN0YXRpYyBjcmVhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWUge1xuXHRcdGxldCBmcmFtZSA9IG5ldyBGcmFtZSgpO1xuXG5cdFx0ZnJhbWUueCA9IHg7XG5cdFx0ZnJhbWUueSA9IHk7XG5cdFx0ZnJhbWUud2lkdGggPSB3aWR0aDtcblx0XHRmcmFtZS5oZWlnaHQgPSBoZWlnaHQ7XG5cdFx0ZnJhbWUubmFtZSA9IG5hbWU7XG5cblx0XHRyZXR1cm4gZnJhbWU7XG5cdH1cbn1cbiIsImltcG9ydCB7IEJ1bGxldCB9IGZyb20gJy4vYnVsbGV0JztcbmltcG9ydCB7IENvbGxpc2lvbk1hbmFnZXIgfSBmcm9tICcuL2NvbGxpc2lvbi1tYW5hZ2VyJztcbmltcG9ydCB7IEVuZW15IH0gZnJvbSAnLi9lbmVteSc7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4vaW5wdXQnO1xuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSAnLi9wbGF5ZXInO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL3JlbmRlcmVyJztcbmltcG9ydCB7IFVwZGF0ZXIgfSBmcm9tICcuL3VwZGF0ZXInOyBcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcblx0Y29udGFpbmVyIDogc3RyaW5nO1xuXHRzaG93QUFCQiA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcblx0cHVibGljIGNvbmZpZyA6IENvbmZpZztcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xuXHRwdWJsaWMgY29udGV4dCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblx0cHVibGljIGlzUnVubmluZyA9IGZhbHNlO1xuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XG5cdHB1YmxpYyBidWxsZXRzOiBCdWxsZXRbXSA9IFtdO1xuXHRwdWJsaWMgZW5lbWllczogRW5lbXlbXSA9IFtdO1xuXG5cdHB1YmxpYyBnYW1lVGltZTogRGF0ZTtcblxuXHRwdWJsaWMgbWFwOiBNYXA7XG5cdHB1YmxpYyBpbnB1dDogSW5wdXQ7XG5cdHB1YmxpYyB2aWV3cG9ydDogVmlld3BvcnQ7XG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XG5cdHB1YmxpYyB1cGRhdGVyOiBVcGRhdGVyO1xuXHRwdWJsaWMgY29sbGlzaW9uczogQ29sbGlzaW9uTWFuYWdlcjtcblx0cHVibGljIG1vdXNlOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuXHQvKipcblx0ICogUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHVuaXF1ZSBJRDsgdXNlZCB0byBjYW5jZWwgUkFGLWxvb3Bcblx0ICogQHR5cGUge251bWJlcn1cblx0ICovXG5cdHByaXZhdGUgX3JhZklkIDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XG5cdFx0dGhpcy5jb25maWcgPSBjb25maWc7XG5cdFx0dGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29uZmlnLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMucGxheWVyID0gbmV3IFBsYXllcih0aGlzKTtcblx0XHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcblx0XHR0aGlzLmlucHV0ID0gbmV3IElucHV0KHRoaXMpO1xuXHRcdHRoaXMudmlld3BvcnQgPSBuZXcgVmlld3BvcnQodGhpcyk7XG5cdFx0dGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcih0aGlzKTtcblx0XHR0aGlzLnVwZGF0ZXIgPSBuZXcgVXBkYXRlcih0aGlzKTtcblx0XHR0aGlzLmNvbGxpc2lvbnMgPSBuZXcgQ29sbGlzaW9uTWFuYWdlcih0aGlzKTtcblx0XHR0aGlzLmVuZW1pZXMucHVzaChuZXcgRW5lbXkodGhpcy5wbGF5ZXIpKTtcblx0fVxuXG5cdHRpY2soKSA6IHZvaWQge1xuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0aWYgKHRoaXMuaXNSdW5uaW5nKSB7XG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuXHRcdFx0dGhpcy51cGRhdGVyLnVwZGF0ZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljay5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdHJ1bigpIDogdm9pZCB7XG5cdFx0aWYgKHRoaXMuaXNSdW5uaW5nID09PSBmYWxzZSkge1xuXHRcdFx0dGhpcy50aWNrKCk7XG5cblx0XHRcdHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRzdG9wKCkgOiB2b2lkIHtcblx0XHRpZiAodGhpcy5pc1J1bm5pbmcpIHtcblx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZklkKTtcblxuXHRcdFx0dGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxubGV0IGdhbWUgPSBuZXcgR2FtZSh7XG5cdGNvbnRhaW5lcjogJy5nYW1lJyxcblx0c2hvd0FBQkI6IGZhbHNlXG59KTtcblxuZ2FtZS5ydW4oKTsiLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XG5cbmV4cG9ydCBlbnVtIEFjdGlvbiB7IFxuXHRVcCwgXG5cdERvd24sXG5cdExlZnQsXG5cdFJpZ2h0LFxuXHRBdHRhY2tcbn1cblxuZW51bSBLZXkge1xuXHRXID0gODcsXG5cdEEgPSA2NSxcblx0UyA9IDgzLFxuXHREID0gNjgsXG5cdFVwID0gMzgsXG5cdERvd24gPSA0MCxcblx0TGVmdCA9IDM3LFxuXHRSaWdodCA9IDM5XG59XG5cbmV4cG9ydCBjbGFzcyBJbnB1dCB7XG5cdHByaXZhdGUgX2JpbmRpbmdzIDogTWFwPEFjdGlvbj4gPSB7XG5cdFx0W0tleS5XXSA6IEFjdGlvbi5VcCxcblx0XHRbS2V5LkFdIDogQWN0aW9uLkxlZnQsXG5cdFx0W0tleS5TXSA6IEFjdGlvbi5Eb3duLFxuXHRcdFtLZXkuRF0gOiBBY3Rpb24uUmlnaHQsXG5cdFx0W0tleS5VcF0gOiBBY3Rpb24uVXAsXG5cdFx0W0tleS5Eb3duXSA6IEFjdGlvbi5Eb3duLFxuXHRcdFtLZXkuTGVmdF0gOiBBY3Rpb24uTGVmdCxcblx0XHRbS2V5LlJpZ2h0XSA6IEFjdGlvbi5SaWdodFxuXHR9O1xuXG5cdHB1YmxpYyBhY3Rpb25zIDogTWFwPGJvb2xlYW4+ID0ge307XG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXHRwcml2YXRlIF9tb3VzZVBvczogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcblxuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuZ2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpKTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcC5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdGJpbmQoa2V5OiBLZXksIGFjdGlvbjogQWN0aW9uKSB7XG5cdFx0dGhpcy51bmJpbmQoa2V5KTtcblxuXHRcdHRoaXMuX2JpbmRpbmdzW2tleV0gPSBhY3Rpb247XG5cdH1cblxuXHR1bmJpbmQoa2V5OiBLZXkpIHtcblx0XHRpZiAodGhpcy5fYmluZGluZ3Nba2V5XSkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuX2JpbmRpbmdzW2tleV07XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBvbktleURvd24oZTogS2V5Ym9hcmRFdmVudCkgeyBcblx0XHRsZXQgYWN0aW9uID0gdGhpcy5fYmluZGluZ3NbZS53aGljaF07XG5cblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuYWN0aW9uc1thY3Rpb25dID0gdHJ1ZTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25LZXlVcChlOiBLZXlib2FyZEV2ZW50KSB7XG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xuXG5cdFx0aWYgKGFjdGlvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IGZhbHNlO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBvbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XG5cblx0XHR0aGlzLmdldE1vdXNlUG9zaXRpb24oZSk7XG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcblx0XHRcdHRoaXMuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSA9IHRydWU7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VVcChlOiBNb3VzZUV2ZW50KSB7XG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XG5cblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gZmFsc2U7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBUT0RPIDogTmVlZHMgYmV0dGVyIGltcGxlbWVudGF0aW9uXG5cdHByaXZhdGUgZ2V0TW91c2VQb3NpdGlvbihlOiBNb3VzZUV2ZW50KSB7IFxuXHRcdGxldCBjYW52YXNPZmZzZXQgPSB0aGlzLl9nYW1lLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdHRoaXMuX21vdXNlUG9zID0ge1xuXHQgICAgICB4OiBlLmNsaWVudFggLSBjYW52YXNPZmZzZXQubGVmdCxcblx0ICAgICAgeTogZS5jbGllbnRZIC0gY2FudmFzT2Zmc2V0LnRvcFxuXHQgICAgfTtcblxuXHQgICBcdHRoaXMuX2dhbWUubW91c2UgPSB7XG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxuXHRcdFx0eTogdGhpcy5fbW91c2VQb3MueSArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyB1cGRhdGUoKSB7XG5cdFx0dGhpcy5fZ2FtZS5tb3VzZSA9IHtcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XG5cdFx0fVxuXHR9XG59IiwiZXhwb3J0IGNsYXNzIE1hcCB7IFxuXHRwdWJsaWMgd2lkdGggOiBudW1iZXIgPSAyMDAwO1xuXHRwdWJsaWMgaGVpZ2h0IDogbnVtYmVyID0gMTUwMDtcbn0iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcblxuXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XG5cdCAvKipcbiAgICAgKiBDaGVja3MgaWYgdHdvIHJlY3Rhbmd1bGFyIGJvZGllcyBpbnRlcnNlY3RcbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MSBGaXJzdCBib2R5IHdpdGgge3gseX0gcG9zaXRpb24gYW5kIHt3aWR0aCwgaGVpZ2h0fVxuICAgICAqIEBwYXJhbSAge1JlY3R9IGJvZHkyIFNlY29uZCBib2R5XG4gICAgICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiB0aGV5IGludGVyc2VjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgc3RhdGljIGludGVyc2VjdHMoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5KSA6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaW50ZXJzZWN0aW9uWCA9IGJvZHkxLnBvc2l0aW9uLnggPCBib2R5Mi5wb3NpdGlvbi54ICsgYm9keTIud2lkdGggXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW50ZXJzZWN0aW9uWSA9IGJvZHkxLnBvc2l0aW9uLnkgPCBib2R5Mi5wb3NpdGlvbi55ICsgYm9keTIuaGVpZ2h0IFxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcblxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uWCAmJiBpbnRlcnNlY3Rpb25ZO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb2xsaWRlKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSwgY29sbGlzaW9uQ2FsbGJhY2s6IEZ1bmN0aW9uKSA6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcbiAgICAgICAgICAgIGNvbGxpc2lvbkNhbGxiYWNrKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vaW5wdXQnO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5pbXBvcnQgeyBCdWxsZXQgfSBmcm9tICcuL2J1bGxldCc7XG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cdHByaXZhdGUgX2xhc3RTaG90IDogRGF0ZSA9IG5ldyBEYXRlKDApO1xuXG5cdHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoMTAsIDEwKSwgMzYsIDM2KTtcblx0cHVibGljIHNwZWVkOiBudW1iZXIgPSAzO1xuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XG5cblx0cHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcblx0ICAgICdpZGxlJyA6IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHQgICAgJ3JpZ2h0JyA6IG5ldyBBbmltYXRpb24oNCwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcblx0fTtcblx0cHJpdmF0ZSBfYnVsbGV0T2Zmc2V0IDogUG9pbnQgPSB7IHg6IDEyLCB5OiAxOCB9O1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xuXHR9XG5cblx0c2hvb3QoKSA6IHZvaWQge1xuXHRcdGlmICh0aGlzLmNhblNob290KCkpIHtcblx0XHRcdHRoaXMuX2xhc3RTaG90ID0gbmV3IERhdGUoKTtcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIHsgXG5cdFx0XHRcdHg6IHRoaXMuYm9keS5wb3NpdGlvbi54ICsgdGhpcy5fYnVsbGV0T2Zmc2V0LngsIFxuXHRcdFx0XHR5OiB0aGlzLmJvZHkucG9zaXRpb24ueSArIHRoaXMuX2J1bGxldE9mZnNldC55IFxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGJ1bGxldFNwYXduLCB0aGlzLl9nYW1lLm1vdXNlLCB0aGlzKTtcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjYW5TaG9vdCgpIDogYm9vbGVhbiB7XG5cdFx0bGV0IGRpZmYgPSB0aGlzLl9nYW1lLmdhbWVUaW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RTaG90LmdldFRpbWUoKTtcblxuXHRcdHJldHVybiBkaWZmID4gdGhpcy5hdHRhY2tTcGVlZDtcblx0fVxuXG5cdGFuaW1hdGUoYW5pbWF0aW9uIDogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGF0ZU1vdmVtZW50KCkgOiB2b2lkIHtcblx0XHRsZXQgaW5wdXQgPSB0aGlzLl9nYW1lLmlucHV0O1xuXG5cdFx0bGV0IG1vdmluZ1ggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSB8fCBpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF07XG5cdFx0bGV0IG1vdmluZ1kgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gfHwgaW5wdXQuYWN0aW9uc1tBY3Rpb24uRG93bl07XG5cblx0XHRsZXQgc3BlZWQgPSBtb3ZpbmdYICYmIG1vdmluZ1kgPyBNYXRoLnNxcnQodGhpcy5zcGVlZCAqIHRoaXMuc3BlZWQgLyAyKSA6IHRoaXMuc3BlZWQ7XG5cblx0XHRsZXQgZGlyZWN0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XG5cblx0XHRkaXJlY3Rpb24ueCA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLkxlZnRdICA/IC0xIDogMSxcblx0XHRkaXJlY3Rpb24ueSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSA/IC0xIDogMVxuXG5cdFx0ZGlyZWN0aW9uLnggPSBtb3ZpbmdYID8gZGlyZWN0aW9uLnggOiAwO1xuXHRcdGRpcmVjdGlvbi55ID0gbW92aW5nWSA/IGRpcmVjdGlvbi55IDogMDtcblxuXHRcdHRoaXMuYm9keS52ZWxvY2l0eS54ID0gZGlyZWN0aW9uLnggKiBzcGVlZDtcblx0XHR0aGlzLmJvZHkudmVsb2NpdHkueSA9IGRpcmVjdGlvbi55ICogc3BlZWQ7XG5cblx0XHRjb25zb2xlLmxvZyhcIlBsYXllciBzcGVlZDogXCIgKyB0aGlzLmJvZHkuc3BlZWQpO1xuXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xuXG5cdFx0aWYgKGlucHV0LmFjdGlvbnNbQWN0aW9uLkF0dGFja10pIHtcblx0ICAgICAgICB0aGlzLnNob290KCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb24oKSB7XG5cdFx0bGV0IGFuaW1hdGlvbiA9IHRoaXMuX2dhbWUubW91c2UueCA+IHRoaXMuYm9keS5wb3NpdGlvbi54ID8gJ3JpZ2h0JyA6ICdsZWZ0JztcblxuXHRcdHRoaXMuYW5pbWF0ZShhbmltYXRpb24pO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLnVwYXRlTW92ZW1lbnQoKTtcblx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbigpO1xuXHR9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcblx0eCA6IG51bWJlcjtcblx0eSA6IG51bWJlcjtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY3QgeyBcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgVmVjdG9yIHtcblx0eCA6IG51bWJlciA9IDA7XG5cdHkgOiBudW1iZXIgPSAwO1xuXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cdH1cblxuXHRwdWJsaWMgc2V0KHZhbHVlOiBudW1iZXIgfCBWZWN0b3IpOiB2b2lkIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHR0aGlzLnggPSB0aGlzLnkgPSB2YWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy54ID0gdmFsdWUueDtcblx0XHRcdHRoaXMueSA9IHZhbHVlLnk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGNsb25lKCk6IFZlY3RvciB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpO1xuXHR9XG5cblx0cHVibGljIG1hZ25pdHVkZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcblx0fVxuXG5cdHN0YXRpYyBhZGQodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYzEueCArIHZlYzIueCwgdmVjMS55ICsgdmVjMi55KTtcblx0fVxuXG5cdHN0YXRpYyBzdWJ0cmFjdCh2ZWMxOiBWZWN0b3IsIHZlYzI6IFZlY3Rvcik6IFZlY3RvciB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjMS54IC0gdmVjMi54LCB2ZWMxLnkgLSB2ZWMyLnkpO1xuXHR9XG5cblx0c3RhdGljIG11bHRpcGx5KHZlYzogVmVjdG9yLCBzY2FsYXI6IG51bWJlcikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYy54ICogc2NhbGFyLCB2ZWMueSAqIHNjYWxhcik7XG5cdH1cbn0iLCJpbXBvcnQgeyBHYW1lLCBDb25maWcgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXG5cdHByaXZhdGUgX3RpbGUgPSB7XG5cdFx0d2lkdGggOiAzMCxcblx0XHRoZWlnaHQ6IDMwXG5cdH1cblxuXG5cdC8qKlxuXHQgKlx0U3ByaXRlcyBJIHVzZSBmb3IgYSBkZXZlbG9wbWVudCB3ZXJlIGNyZWF0ZWQgYnkgQ29keSBTaGVwcCBmb3IgaGlzIGdhbWUgRGVudGFsIERlZmVuZGVyOiBTYWdhIG9mIHRoZSBDYW5keSBIb3JkZS5cblx0ICpcdFBsZWFzZSBjaGVjayBoaXMgZ2l0aHViIHJlcG86IGh0dHBzOi8vZ2l0aHViLmNvbS9jc2hlcHAvY2FuZHlqYW0vXG5cdCAqL1xuXHRwcml2YXRlIF9yZXNvdXJjZXMgPSB7XG5cdFx0J3BsYXllcicgOiAnLi9pbWcvcGxheWVyLnBuZycsXG5cdFx0J2VuZW15JyA6ICcuL2ltZy9lbmVteS5wbmcnLFxuXHRcdCdidWxsZXQnIDogJy4vaW1nL2J1bGxldC5wbmcnXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUaWxlKHBvczogUG9pbnQsIGNvbG9yOiBzdHJpbmcpIDogdm9pZCB7XG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LnJlY3QocG9zLngsIHBvcy55LCB0aGlzLl90aWxlLndpZHRoLCB0aGlzLl90aWxlLmhlaWdodCk7XG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGwoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclRpbGVzKCkgOiB2b2lkIHtcbiAgICAgICAgbGV0IGNvbG9ycyA9IFtcIiM3ODVjOThcIiwgXCIjNjk0Zjg4XCJdO1xuXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5fZ2FtZS5tYXAud2lkdGg7IHggKz0gdGhpcy5fdGlsZS53aWR0aCkge1xuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQ7IHkgKz0gdGhpcy5fdGlsZS5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBsZXQgeEluZGV4ID0gKHggLyB0aGlzLl90aWxlLndpZHRoKSAlIDI7XG4gICAgICAgICAgICAgICAgbGV0IHlJbmRleCA9ICh5IC8gdGhpcy5fdGlsZS5oZWlnaHQpICUgMjtcblxuICAgICAgICAgICAgICAgIGxldCB0aWxlUG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoe3gsIHl9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlUG9zLCBjb2xvcnNbeEluZGV4IF4geUluZGV4XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbWVyYU9mZnNldChwb3M6IFBvaW50KSA6IFBvaW50IHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IHBvcy55IC0gc2VsZi5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XG4gICAgICAgIH07XG4gICAgfVxuXG5cdHByaXZhdGUgcmVuZGVySGVscGVyKHNvdXJjZSA6IHN0cmluZywgY29sbGVjdGlvbiA6IEVudGl0eVtdKSB7XG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXHRcdGltZy5zcmMgPSBzb3VyY2U7XG5cblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHtcblx0XHRcdGxldCBmcmFtZSA9IGUuY3VycmVudEFuaW1hdGlvbi5jdXJyZW50RnJhbWU7XG5cdFx0XHRsZXQgcG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoZS5ib2R5LnBvc2l0aW9uKTtcblxuXHRcdFx0aWYgKHRoaXMuX2dhbWUuY29uZmlnLnNob3dBQUJCKSB7XG5cdFx0XHRcdHRoaXMucmVuZGVyQUFCQihuZXcgQm9keShuZXcgVmVjdG9yKHBvcy54LCBwb3MueSksIGUuYm9keS53aWR0aCwgZS5ib2R5LmhlaWdodCkpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9nYW1lLmNvbnRleHQuZHJhd0ltYWdlKFxuXHRcdFx0XHRpbWcsXG5cdFx0XHRcdGZyYW1lLngsIGZyYW1lLnksXG5cdFx0XHRcdGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHQsXG5cdFx0XHRcdHBvcy54LCBwb3MueSxcblx0XHRcdFx0ZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodFxuXHRcdFx0KTtcblxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJBQUJCKGJvZHk6IEJvZHkpIHtcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC50cmFuc2xhdGUoMC41LCAwLjUpO1xuXHRcdGN0eC5yZWN0KFxuXHRcdFx0Ym9keS5wb3NpdGlvbi54LFxuXHRcdFx0Ym9keS5wb3NpdGlvbi55LFxuXHRcdFx0Ym9keS53aWR0aCxcblx0XHRcdGJvZHkuaGVpZ2h0XG5cdFx0KTtcblxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC50cmFuc2xhdGUoLTAuNSwgLTAuNSk7XG5cdH1cblxuXHRyZW5kZXIoKSA6IHZvaWQge1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHRoaXMucmVuZGVyVGlsZXMoKTtcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2J1bGxldCddLCB0aGlzLl9nYW1lLmJ1bGxldHMpO1xuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snZW5lbXknXSwgdGhpcy5fZ2FtZS5lbmVtaWVzKTtcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ3BsYXllciddLCBbdGhpcy5fZ2FtZS5wbGF5ZXJdKTtcblx0fVxuXG5cdGNsZWFyKCkgOiB2b2lkIHtcblx0XHRsZXQgdyA9IHRoaXMuX2dhbWUuY2FudmFzLndpZHRoO1xuXHRcdGxldCBoID0gdGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0O1xuXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcblx0fVxufVxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVyIHtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdH1cblxuXHRwcml2YXRlIGFsbEVudGl0aWVzKCkgOiBFbnRpdHlbXSB7XG5cdFx0cmV0dXJuIDxFbnRpdHlbXT4gQXJyYXkucHJvdG90eXBlLmNvbmNhdChcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cyxcblx0XHRcdHRoaXMuX2dhbWUuZW5lbWllcyxcblx0XHRcdHRoaXMuX2dhbWUucGxheWVyXG5cdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9ucygpIDogdm9pZCB7XG5cdFx0bGV0IGVudGl0aWVzID0gdGhpcy5hbGxFbnRpdGllcygpO1xuXG5cdFx0ZW50aXRpZXMuZm9yRWFjaCgoZSk9PiB7IGUuY3VycmVudEFuaW1hdGlvbi51cGRhdGUodGhpcy5fZ2FtZS5nYW1lVGltZSk7IH0pO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVFbnRpdGllcygpIDogdm9pZCB7XG5cdFx0bGV0IGVudGl0aWVzID0gdGhpcy5hbGxFbnRpdGllcygpO1xuXG5cdFx0ZW50aXRpZXMuZm9yRWFjaChlID0+IHsgZS51cGRhdGUoKTsgfSk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZURlYWQoKSA6IHZvaWQge1xuXHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKGUgPT4geyB0aGlzLnJlbW92ZURlYWQoZSwgdGhpcy5fZ2FtZS5idWxsZXRzKTsgfSlcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaChlID0+IHsgdGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuZW5lbWllcyk7IH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZURlYWQoZTogRW50aXR5LCBjb2xsZWN0aW9uOiBFbnRpdHlbXSkge1xuXHRcdGlmIChlLmFsaXZlID09PSBmYWxzZSkge1xuXHRcdFx0bGV0IGVJbmRleCA9IGNvbGxlY3Rpb24uaW5kZXhPZihlKTtcblxuXHRcdFx0aWYgKGVJbmRleCA+IC0xKSB7XG5cdFx0XHRcdGNvbGxlY3Rpb24uc3BsaWNlKGVJbmRleCwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbnMoKTtcblx0XHR0aGlzLnVwZGF0ZUVudGl0aWVzKCk7XG5cdFx0dGhpcy51cGRhdGVEZWFkKCk7XG5cdFx0dGhpcy5fZ2FtZS52aWV3cG9ydC50YXJnZXQgPSB0aGlzLl9nYW1lLnBsYXllci5ib2R5LnBvc2l0aW9uO1xuXHRcdHRoaXMuX2dhbWUudmlld3BvcnQudXBkYXRlKCk7XG5cdFx0dGhpcy5fZ2FtZS5jb2xsaXNpb25zLnVwZGF0ZSgpO1xuXHRcdHRoaXMuX2dhbWUuaW5wdXQudXBkYXRlKCk7XG5cdH1cbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge307XG5cbmV4cG9ydCBjbGFzcyBVdGlsIHtcblx0c3RhdGljIGNsYW1wKHZhbHVlIDogbnVtYmVyLCBtaW4gOiBudW1iZXIsIG1heCA6IG51bWJlcikgOiBudW1iZXIge1xuXHRcdGlmICh2YWx1ZSA+IG1heCkgeyByZXR1cm4gbWF4OyB9XG5cdFx0aWYgKHZhbHVlIDwgbWluKSB7IHJldHVybiBtaW47IH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxufVxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0cHVibGljIHRhcmdldDogUG9pbnQ7XG5cdHB1YmxpYyBwb3NpdGlvbjogUG9pbnQgPSB7IHggOiAwLCB5IDogMCB9O1xuXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XG5cdHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XG5cdHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xuXHRcdHRoaXMuX2hlaWdodCA9IGdhbWVJbnN0YW5jZS5jYW52YXMuaGVpZ2h0O1xuXHR9XG5cblx0cHJpdmF0ZSBjYWxjdWxhdGVQb3NpdGlvbigpIDogdm9pZCB7XG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC54IC0gdGhpcy5fd2lkdGggLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC53aWR0aCAtIHRoaXMuX3dpZHRoKTtcblx0XHR0aGlzLnBvc2l0aW9uLnkgPSBVdGlsLmNsYW1wKHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHQpO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XG5cdH1cbn0iXX0=
