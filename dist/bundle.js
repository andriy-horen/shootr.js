(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animation = void 0;
const Const = __importStar(require("./const"));
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const primitives_1 = require("./primitives");
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bullet = void 0;
const entity_1 = require("./entity");
const body_1 = require("./body");
const primitives_1 = require("./primitives");
const animation_1 = require("./animation");
const frame_1 = require("./frame");
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionManager = void 0;
const physics_1 = require("./physics");
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
        this._game.walls.forEach((w) => {
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
        this._game.walls.forEach((w) => {
            this._game.bullets.forEach((b) => {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MS_IN_SEC = void 0;
exports.MS_IN_SEC = 1000;
},{}],6:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = void 0;
const entity_1 = require("./entity");
const primitives_1 = require("./primitives");
const body_1 = require("./body");
const frame_1 = require("./frame");
const animation_1 = require("./animation");
const Random = __importStar(require("./random"));
class Enemy extends entity_1.Entity {
    constructor(gameInstance, target) {
        super();
        this._animations = {
            idle: new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 36, 36)),
            right: new animation_1.Animation(4, 0, frame_1.Frame.create(0, 0, 36, 36)),
            left: new animation_1.Animation(4, 1, frame_1.Frame.create(0, 0, 36, 36)),
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
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
        return frame;
    }
}
exports.Frame = Frame;
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const collision_manager_1 = require("./collision-manager");
const enemy_1 = require("./enemy");
const wall_1 = require("./wall");
const input_1 = require("./input");
const map_1 = require("./map");
const player_1 = require("./player");
const renderer_1 = require("./renderer");
const updater_1 = require("./updater");
const viewport_1 = require("./viewport");
class Game {
    constructor(config) {
        this.isRunning = false;
        this.bullets = [];
        this.enemies = [];
        this.walls = [];
        this.score = 0;
        this.mouse = { x: 0, y: 0 };
        this.config = config;
        this.canvas = (document.querySelector(config.container));
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
    showAABB: false,
});
game.run();
},{"./collision-manager":4,"./enemy":6,"./input":10,"./map":11,"./player":13,"./renderer":16,"./updater":17,"./viewport":19,"./wall":20}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = exports.Action = void 0;
var Action;
(function (Action) {
    Action[Action["Up"] = 0] = "Up";
    Action[Action["Down"] = 1] = "Down";
    Action[Action["Left"] = 2] = "Left";
    Action[Action["Right"] = 3] = "Right";
    Action[Action["Attack"] = 4] = "Attack";
})(Action = exports.Action || (exports.Action = {}));
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
            [Key.Right]: Action.Right,
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
            y: e.clientY - canvasOffset.top,
        };
        this._game.mouse = {
            x: this._mousePos.x + this._game.viewport.position.x,
            y: this._mousePos.y + this._game.viewport.position.y,
        };
    }
    update() {
        this._game.mouse = {
            x: this._mousePos.x + this._game.viewport.position.x,
            y: this._mousePos.y + this._game.viewport.position.y,
        };
    }
}
exports.Input = Input;
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = void 0;
class Map {
    constructor() {
        this.width = 2000;
        this.height = 1500;
    }
}
exports.Map = Map;
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Physics = void 0;
const primitives_1 = require("./primitives");
class Physics {
    static intersects(body1, body2) {
        let intersectionX = body1.position.x < body2.position.x + body2.width &&
            body1.position.x + body1.width > body2.position.x;
        let intersectionY = body1.position.y < body2.position.y + body2.height &&
            body1.position.y + body1.height > body2.position.y;
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
        let overlapX2 = body2.position.x + body2.width - body1.position.x;
        let overlapY1 = body2.position.y - (body1.position.y + body1.height);
        let overlapY2 = body2.position.y + body2.height - body1.position.y;
        let overlapX = Math.abs(overlapX1) < Math.abs(overlapX2) ? overlapX1 : overlapX2;
        let overlapY = Math.abs(overlapY1) < Math.abs(overlapY2) ? overlapY1 : overlapY2;
        return primitives_1.Vector.from({ x: overlapX, y: overlapY });
    }
}
exports.Physics = Physics;
},{"./primitives":14}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const entity_1 = require("./entity");
const primitives_1 = require("./primitives");
const input_1 = require("./input");
const body_1 = require("./body");
const bullet_1 = require("./bullet");
const frame_1 = require("./frame");
const animation_1 = require("./animation");
class Player extends entity_1.Entity {
    constructor(gameInstance) {
        super();
        this._lastShot = new Date(0);
        this.body = new body_1.Body(new primitives_1.Vector(10, 10), 36, 36);
        this.speed = 3;
        this.attackSpeed = 150;
        this._animations = {
            idle: new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 36, 36)),
            right: new animation_1.Animation(4, 0, frame_1.Frame.create(0, 0, 36, 36)),
            left: new animation_1.Animation(4, 1, frame_1.Frame.create(0, 0, 36, 36)),
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
                y: this.body.position.y + this._bulletOffset.y,
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
        let speed = movingX && movingY
            ? Math.sqrt((this.speed * this.speed) / 2)
            : this.speed;
        let direction = new primitives_1.Vector();
        (direction.x = input.actions[input_1.Action.Left] ? -1 : 1),
            (direction.y = input.actions[input_1.Action.Up] ? -1 : 1);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = void 0;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomInt = void 0;
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomInt = getRandomInt;
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const primitives_1 = require("./primitives");
const body_1 = require("./body");
class Renderer {
    constructor(gameInstance) {
        this._tile = {
            width: 30,
            height: 30,
        };
        this._resources = {
            player: './img/player.png',
            enemy: './img/enemy.png',
            bullet: './img/bullet.png',
            wall: './img/tree-red-1.png',
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
                let tilePos = this.cameraOffset({ x, y });
                this.renderTile(tilePos, colors[xIndex ^ yIndex]);
            }
        }
    }
    cameraOffset(pos) {
        let self = this;
        return {
            x: pos.x - self._game.viewport.position.x,
            y: pos.y - self._game.viewport.position.y,
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updater = void 0;
class Updater {
    constructor(gameInstance) {
        this._game = gameInstance;
    }
    allEntities() {
        return (Array.prototype.concat(this._game.bullets, this._game.enemies, this._game.player));
    }
    updateAnimations() {
        let entities = this.allEntities();
        entities.forEach((e) => {
            e.currentAnimation.update(this._game.gameTime);
        });
    }
    updateEntities() {
        let entities = this.allEntities();
        entities.forEach((e) => {
            e.update();
        });
    }
    updateDead() {
        this._game.bullets.forEach((e) => {
            this.removeDead(e, this._game.bullets);
        });
        this._game.enemies.forEach((e) => {
            this.removeDead(e, this._game.enemies);
        });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = exports.noop = void 0;
function noop() { }
exports.noop = noop;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewport = void 0;
const util_1 = require("./util");
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wall = void 0;
const entity_1 = require("./entity");
const animation_1 = require("./animation");
const frame_1 = require("./frame");
const body_1 = require("./body");
const primitives_1 = require("./primitives");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9wcmltaXRpdmVzLnRzIiwic3JjL2pzL3JhbmRvbS50cyIsInNyYy9qcy9yZW5kZXJlci50cyIsInNyYy9qcy91cGRhdGVyLnRzIiwic3JjL2pzL3V0aWwudHMiLCJzcmMvanMvdmlld3BvcnQudHMiLCJzcmMvanMvd2FsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNDQSwrQ0FBaUM7QUFFakMsTUFBYSxTQUFTO0lBbUJyQixZQUFZLE1BQWMsRUFBRSxHQUFXLEVBQUUsS0FBWTtRQVo5QyxVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBTWxCLFNBQUksR0FBWSxJQUFJLENBQUM7UUFFcEIsa0JBQWEsR0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUt6QyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQzVELENBQUM7SUFFRCxVQUFVLENBQUMsSUFBVTtRQUNwQixJ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SUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZTtRQUNsQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFH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QUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxLQUFLLEVBQUU7WUFDNUMsT0FBTyxtQkFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkM7UUFFRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRWxFLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JFLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFbkUsSUFBSSxRQUFRLEdBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNuRSxJQUFJLFFBQVEsR0FDWCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRW5FLE9BQU8sbUJBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxR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Iiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCAqIGFzIENvbnN0IGZyb20gJy4vY29uc3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XHJcblx0cHVibGljIGN1cnJlbnRGcmFtZTogRnJhbWU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE51bWJlciBvZiBmcmFtZXMgcGVyIHNlY29uZFxyXG5cdCAqIEB0eXBlIHtudW1iZXJ9XHJcblx0ICovXHJcblx0cHVibGljIHNwZWVkOiBudW1iZXIgPSAwO1xyXG5cdC8qKlxyXG5cdCAqIFRPRE86IEltcGxlbWVudCwgZmllbGQgaXMgbm90IHVzZWRcclxuXHQgKiBTZXQgdG8gdHJ1ZSB0byBtYWtlIGFuaW1hdGlvbiBsb29wZWQsIGZhbHNlIC0gZm9yIG9uZSBjeWNsZSBvbmx5XHJcblx0ICogQHR5cGUge2Jvb2xlYW59XHJcblx0ICovXHJcblx0cHVibGljIGxvb3A6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuXHRwcml2YXRlIF9sYXN0QW5pbWF0ZWQ6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHRwcml2YXRlIF9yb3c6IG51bWJlcjtcclxuXHRwcml2YXRlIF9sZW5ndGg6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IobGVuZ3RoOiBudW1iZXIsIHJvdzogbnVtYmVyLCBmcmFtZTogRnJhbWUpIHtcclxuXHRcdHRoaXMuX3JvdyA9IHJvdztcclxuXHRcdHRoaXMuX2xlbmd0aCA9IGxlbmd0aDtcclxuXHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IGZyYW1lO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueSA9IHRoaXMuX3JvdyAqIHRoaXMuY3VycmVudEZyYW1lLmhlaWdodDtcclxuXHR9XHJcblxyXG5cdGNhbkFuaW1hdGUodGltZTogRGF0ZSk6IGJvb2xlYW4ge1xyXG5cdFx0bGV0IGFuaW1hdGlvbkRlbHRhID0gdGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0QW5pbWF0ZWQuZ2V0VGltZSgpO1xyXG5cclxuXHRcdHJldHVybiBhbmltYXRpb25EZWx0YSA+IHRoaXMuZGVsYXk7XHJcblx0fVxyXG5cclxuXHRnZXQgZGVsYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBDb25zdC5NU19JTl9TRUMgLyB0aGlzLnNwZWVkO1xyXG5cdH1cclxuXHJcblx0bmV4dCgpOiB2b2lkIHtcclxuXHRcdGxldCBpbmRleCA9IHRoaXMuY3VycmVudEZyYW1lLmluZGV4O1xyXG5cclxuXHRcdGluZGV4ID0gKGluZGV4ICsgMSkgJSB0aGlzLl9sZW5ndGg7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5pbmRleCA9IGluZGV4O1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IGluZGV4ICogdGhpcy5jdXJyZW50RnJhbWUud2lkdGg7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoZ2FtZVRpbWU6IERhdGUpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmNhbkFuaW1hdGUoZ2FtZVRpbWUpKSB7XHJcblx0XHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IGdhbWVUaW1lO1xyXG5cclxuXHRcdFx0dGhpcy5uZXh0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IG5ldyBEYXRlKDApO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUuaW5kZXggPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IDA7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL3dvcmxkJztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvZHkge1xyXG5cdHBvc2l0aW9uOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XHJcblx0dmVsb2NpdHk6IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcclxuXHRvdmVybGFwOiBWZWN0b3IgPSBuZXcgVmVjdG9yKCk7XHJcblx0c3BlZWQ6IG51bWJlcjtcclxuXHR3aWR0aDogbnVtYmVyO1xyXG5cdGhlaWdodDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjogVmVjdG9yLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPOiBOZWVkcyB0byBiZSBpbXByb3ZlZCBiZWFjYXVzZSBtb3JlIEZQUyByZXN1bHRzIGluIGZhc3RlciBtb3ZlbWVudDtcclxuXHRwcml2YXRlIHVwZGF0ZU1vdmVtZW50KCk6IHZvaWQge1xyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IFZlY3Rvci5hZGQodGhpcy5wb3NpdGlvbiwgdGhpcy52ZWxvY2l0eSk7XHJcblxyXG5cdFx0dGhpcy5zcGVlZCA9IE1hdGguaHlwb3QodGhpcy52ZWxvY2l0eS54LCB0aGlzLnZlbG9jaXR5LnkpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge1xyXG5cdFx0dGhpcy51cGRhdGVNb3ZlbWVudCgpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVsbGV0IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwdWJsaWMgdGFyZ2V0OiBQb2ludDtcclxuXHRwdWJsaWMgcGFyZW50OiBFbnRpdHk7XHJcblx0cHVibGljIHNwZWVkOiBudW1iZXIgPSAxMDtcclxuXHRwdWJsaWMgZGFtYWdlQW1vdW50OiBudW1iZXIgPSAxMDtcclxuXHRwdWJsaWMgYm9keTogQm9keSA9IG5ldyBCb2R5KG5ldyBWZWN0b3IoKSwgMywgMyk7XHJcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdEZyYW1lLmNyZWF0ZSgwLCAwLCAxMCwgMTApXHJcblx0KTtcclxuXHJcblx0Y29uc3RydWN0b3IocG9zaXRpb246IFBvaW50LCB0YXJnZXQ6IFBvaW50LCBwYXJlbnQ6IEVudGl0eSkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLmJvZHkucG9zaXRpb24gPSBuZXcgVmVjdG9yKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xyXG5cdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuXHJcblx0XHR0aGlzLnNldFZlbG9jaXR5KHRoaXMudGFyZ2V0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0VmVsb2NpdHkocG9zaXRpb246IFBvaW50KTogdm9pZCB7XHJcblx0XHRsZXQgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xyXG5cdFx0bGV0IGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcclxuXHJcblx0XHRsZXQgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XHJcblx0XHRsZXQgZGlyWSA9IHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSA+IDAgPyAxIDogLTE7XHJcblxyXG5cdFx0bGV0IHggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XHJcblx0XHRsZXQgeSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcclxuXHJcblx0XHR0aGlzLmJvZHkudmVsb2NpdHkgPSBuZXcgVmVjdG9yKHgsIHkpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgUGh5c2ljcyB9IGZyb20gJy4vcGh5c2ljcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uTWFuYWdlciB7XHJcblx0cHJpdmF0ZSBfZ2FtZTogR2FtZTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKChidWxsZXQpID0+IHtcclxuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUoZW5lbXkuYm9keSwgYnVsbGV0LmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRcdGVuZW15LmRhbWFnZShidWxsZXQuZGFtYWdlQW1vdW50LCBidWxsZXQucGFyZW50KTtcclxuXHJcblx0XHRcdFx0XHRidWxsZXQua2lsbCgpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX2dhbWUuc2NvcmUgKz0gMTA7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0UGh5c2ljcy5jb2xsaWRlKGVuZW15LmJvZHksIHRoaXMuX2dhbWUucGxheWVyLmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRlbmVteS5oaXQodGhpcy5fZ2FtZS5wbGF5ZXIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUud2FsbHMuZm9yRWFjaCgodykgPT4ge1xyXG5cdFx0XHRQaHlzaWNzLmNvbGxpZGUodGhpcy5fZ2FtZS5wbGF5ZXIuYm9keSwgdy5ib2R5LCAoKSA9PiB7XHJcblx0XHRcdFx0Ly90aGlzLl9nYW1lLnBsYXllci5ib2R5LmlzQmxvY2tlZCA9IHRydWU7XHJcblx0XHRcdFx0bGV0IG92ZXJsYXAgPSBQaHlzaWNzLmdldE92ZXJsYXAoXHJcblx0XHRcdFx0XHR0aGlzLl9nYW1lLnBsYXllci5ib2R5LFxyXG5cdFx0XHRcdFx0dy5ib2R5XHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0aWYgKE1hdGguYWJzKG92ZXJsYXAueCkgPCBNYXRoLmFicyhvdmVybGFwLnkpKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9nYW1lLnBsYXllci5ib2R5LnBvc2l0aW9uLnggKz0gb3ZlcmxhcC54O1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0aGlzLl9nYW1lLnBsYXllci5ib2R5LnBvc2l0aW9uLnkgKz0gb3ZlcmxhcC55O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLndhbGxzLmZvckVhY2goKHcpID0+IHtcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goKGIpID0+IHtcclxuXHRcdFx0XHRQaHlzaWNzLmNvbGxpZGUody5ib2R5LCBiLmJvZHksICgpID0+IHtcclxuXHRcdFx0XHRcdGIua2lsbCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgTVNfSU5fU0VDID0gMTAwMDtcclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5cclxuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcblxyXG5pbXBvcnQgKiBhcyBSYW5kb20gZnJvbSAnLi9yYW5kb20nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9hbmltYXRpb25zOiB7IFtrZXk6IHN0cmluZ106IEFuaW1hdGlvbiB9ID0ge1xyXG5cdFx0aWRsZTogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRyaWdodDogbmV3IEFuaW1hdGlvbig0LCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRsZWZ0OiBuZXcgQW5pbWF0aW9uKDQsIDEsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHR9O1xyXG5cdHByaXZhdGUgX2xhc3RIaXQ6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHRwcml2YXRlIF9nYW1lOiBHYW1lO1xyXG5cclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uO1xyXG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMi41O1xyXG5cdHB1YmxpYyBkYWdhbWVBbW91bnQ6IG51bWJlciA9IDU7XHJcblx0cHVibGljIGF0dGFja1NwZWVkOiBudW1iZXIgPSAyNTA7XHJcblx0cHVibGljIHRhcmdldDogRW50aXR5O1xyXG5cdHB1YmxpYyBib2R5OiBCb2R5O1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUsIHRhcmdldDogRW50aXR5KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHJcblx0XHRsZXQgcmFuZG9tWCA9IFJhbmRvbS5nZXRSYW5kb21JbnQoMCwgdGhpcy5fZ2FtZS5jYW52YXMud2lkdGgpO1xyXG5cdFx0bGV0IHJhbmRvbVkgPSBSYW5kb20uZ2V0UmFuZG9tSW50KDAsIHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCk7XHJcblxyXG5cdFx0dGhpcy5ib2R5ID0gbmV3IEJvZHkobmV3IFZlY3RvcihyYW5kb21YLCByYW5kb21ZKSwgMzYsIDM2KTtcclxuXHJcblx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XHJcblx0fVxyXG5cclxuXHRhbmltYXRlKGFuaW1hdGlvbjogc3RyaW5nKTogdm9pZCB7XHJcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25zW2FuaW1hdGlvbl07XHJcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24uc3BlZWQgPSAxMDtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE8gOiBpbnZlc3RpZ2F0ZSBpc3N1ZSB3aXRoIGRpYWdvbmFsIHNwZWVkLiB+Mi4xMiB3aGVuIGlzIHN1cHBvc2VkIHRvIGJlIDNcclxuXHRtb3ZlVG93YXJkcyhwb3NpdGlvbjogUG9pbnQpOiB2b2lkIHtcclxuXHRcdGxldCBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcblx0XHRsZXQgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuXHRcdGxldCBkaXJYID0gTWF0aC5zaWduKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcblx0XHRsZXQgZGlyWSA9IE1hdGguc2lnbihwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG5cclxuXHRcdHRoaXMuYm9keS52ZWxvY2l0eS54ID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xyXG5cdFx0dGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XHJcblxyXG5cdFx0aWYgKGRpclggPiAwKSB7XHJcblx0XHRcdHRoaXMuYW5pbWF0ZSgncmlnaHQnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuYW5pbWF0ZSgnbGVmdCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuYm9keS51cGRhdGUoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgY2FuSGl0KCk6IGJvb2xlYW4ge1xyXG5cdFx0bGV0IGRpZmYgPSB0aGlzLl9nYW1lLmdhbWVUaW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RIaXQuZ2V0VGltZSgpO1xyXG5cclxuXHRcdHJldHVybiBkaWZmID4gdGhpcy5hdHRhY2tTcGVlZDtcclxuXHR9XHJcblxyXG5cdGhpdCh0YXJnZXQ6IEVudGl0eSk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuSGl0KCkpIHtcclxuXHRcdFx0dGFyZ2V0LmRhbWFnZSh0aGlzLmRhZ2FtZUFtb3VudCwgdGhpcyk7XHJcblxyXG5cdFx0XHR0aGlzLl9sYXN0SGl0ID0gbmV3IERhdGUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpOiB2b2lkIHtcclxuXHRcdHRoaXMubW92ZVRvd2FyZHModGhpcy50YXJnZXQuYm9keS5wb3NpdGlvbik7XHJcblxyXG5cdFx0Ly9jb25zb2xlLmxvZygnRW5lbXkgc3BlZWQ6ICcgKyB0aGlzLmJvZHkuc3BlZWQpO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVudGl0eSB7XHJcblx0cHJpdmF0ZSBfaGVhbHRoOiBudW1iZXIgPSAxMDA7XHJcblx0cHJpdmF0ZSBfYWxpdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdHByaXZhdGUgX2F0dGFja2VyOiBFbnRpdHk7XHJcblxyXG5cdHB1YmxpYyBib2R5OiBCb2R5O1xyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uOiBBbmltYXRpb247XHJcblxyXG5cdGdldCBoZWFsdGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9oZWFsdGg7XHJcblx0fVxyXG5cclxuXHRnZXQgYWxpdmUoKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYWxpdmU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9zZXRIZWFsdGgobnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdGlmICh0aGlzLl9oZWFsdGggPiAwICYmIHRoaXMuX2FsaXZlKSB7XHJcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XHJcblx0XHRcdHRoaXMua2lsbCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0a2lsbCgpIHtcclxuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XHJcblx0XHR0aGlzLl9hbGl2ZSA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0ZGFtYWdlKGFtb3VudDogbnVtYmVyLCBhdHRhY2tlcjogRW50aXR5KTogdm9pZCB7XHJcblx0XHR0aGlzLl9zZXRIZWFsdGgoLWFtb3VudCk7XHJcblxyXG5cdFx0dGhpcy5fYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuXHR9XHJcblxyXG5cdGhlYWwoYW1vdW50OiBudW1iZXIpIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aChhbW91bnQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge31cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgRnJhbWUge1xyXG5cdGluZGV4OiBudW1iZXIgPSAwO1xyXG5cdHg6IG51bWJlciA9IDA7XHJcblx0eTogbnVtYmVyID0gMDtcclxuXHR3aWR0aDogbnVtYmVyID0gMDtcclxuXHRoZWlnaHQ6IG51bWJlciA9IDA7XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWUge1xyXG5cdFx0bGV0IGZyYW1lID0gbmV3IEZyYW1lKCk7XHJcblxyXG5cdFx0ZnJhbWUueCA9IHg7XHJcblx0XHRmcmFtZS55ID0geTtcclxuXHRcdGZyYW1lLndpZHRoID0gd2lkdGg7XHJcblx0XHRmcmFtZS5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG5cdFx0cmV0dXJuIGZyYW1lO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBCdWxsZXQgfSBmcm9tICcuL2J1bGxldCc7XHJcbmltcG9ydCB7IENvbGxpc2lvbk1hbmFnZXIgfSBmcm9tICcuL2NvbGxpc2lvbi1tYW5hZ2VyJztcclxuaW1wb3J0IHsgRW5lbXkgfSBmcm9tICcuL2VuZW15JztcclxuaW1wb3J0IHsgV2FsbCB9IGZyb20gJy4vd2FsbCc7XHJcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcclxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSAnLi9wbGF5ZXInO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IFJlbmRlcmVyIH0gZnJvbSAnLi9yZW5kZXJlcic7XHJcbmltcG9ydCB7IFVwZGF0ZXIgfSBmcm9tICcuL3VwZGF0ZXInO1xyXG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gJy4vdmlld3BvcnQnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xyXG5cdGNvbnRhaW5lcjogc3RyaW5nO1xyXG5cdHNob3dBQUJCOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZSB7XHJcblx0cHVibGljIGNvbmZpZzogQ29uZmlnO1xyXG5cdHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcblx0cHVibGljIGlzUnVubmluZyA9IGZhbHNlO1xyXG5cdHB1YmxpYyBwbGF5ZXI6IFBsYXllcjtcclxuXHRwdWJsaWMgYnVsbGV0czogQnVsbGV0W10gPSBbXTtcclxuXHRwdWJsaWMgZW5lbWllczogRW5lbXlbXSA9IFtdO1xyXG5cdHB1YmxpYyB3YWxsczogV2FsbFtdID0gW107XHJcblxyXG5cdHB1YmxpYyBnYW1lVGltZTogRGF0ZTtcclxuXHRwdWJsaWMgc2NvcmU6IG51bWJlciA9IDA7XHJcblxyXG5cdHB1YmxpYyBtYXA6IE1hcDtcclxuXHRwdWJsaWMgaW5wdXQ6IElucHV0O1xyXG5cdHB1YmxpYyB2aWV3cG9ydDogVmlld3BvcnQ7XHJcblx0cHVibGljIHJlbmRlcmVyOiBSZW5kZXJlcjtcclxuXHRwdWJsaWMgdXBkYXRlcjogVXBkYXRlcjtcclxuXHRwdWJsaWMgY29sbGlzaW9uczogQ29sbGlzaW9uTWFuYWdlcjtcclxuXHRwdWJsaWMgbW91c2U6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblx0LyoqXHJcblx0ICogUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHVuaXF1ZSBJRDsgdXNlZCB0byBjYW5jZWwgUkFGLWxvb3BcclxuXHQgKiBAdHlwZSB7bnVtYmVyfVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3JhZklkOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XHJcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHRcdHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PihcclxuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb25maWcuY29udGFpbmVyKVxyXG5cdFx0KTtcclxuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG5cdFx0dGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHRoaXMpO1xyXG5cdFx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcblx0XHR0aGlzLmlucHV0ID0gbmV3IElucHV0KHRoaXMpO1xyXG5cdFx0dGhpcy52aWV3cG9ydCA9IG5ldyBWaWV3cG9ydCh0aGlzKTtcclxuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIodGhpcyk7XHJcblx0XHR0aGlzLnVwZGF0ZXIgPSBuZXcgVXBkYXRlcih0aGlzKTtcclxuXHRcdHRoaXMuY29sbGlzaW9ucyA9IG5ldyBDb2xsaXNpb25NYW5hZ2VyKHRoaXMpO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XHJcblx0XHRcdHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCB0aGlzLnBsYXllcikpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMud2FsbHMucHVzaChuZXcgV2FsbCh7IHg6IDM1MCwgeTogMjAgfSkpO1xyXG5cdH1cclxuXHJcblx0dGljaygpOiB2b2lkIHtcclxuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0cnVuKCk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuaXNSdW5uaW5nID09PSBmYWxzZSkge1xyXG5cdFx0XHR0aGlzLnRpY2soKTtcclxuXHJcblx0XHRcdHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0b3AoKTogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5pc1J1bm5pbmcpIHtcclxuXHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmSWQpO1xyXG5cclxuXHRcdFx0dGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmxldCBnYW1lID0gbmV3IEdhbWUoe1xyXG5cdGNvbnRhaW5lcjogJy5nYW1lJyxcclxuXHRzaG93QUFCQjogZmFsc2UsXHJcbn0pO1xyXG5cclxuZ2FtZS5ydW4oKTtcclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuXHJcbmV4cG9ydCBlbnVtIEFjdGlvbiB7XHJcblx0VXAsXHJcblx0RG93bixcclxuXHRMZWZ0LFxyXG5cdFJpZ2h0LFxyXG5cdEF0dGFjayxcclxufVxyXG5cclxuZW51bSBLZXkge1xyXG5cdFcgPSA4NyxcclxuXHRBID0gNjUsXHJcblx0UyA9IDgzLFxyXG5cdEQgPSA2OCxcclxuXHRVcCA9IDM4LFxyXG5cdERvd24gPSA0MCxcclxuXHRMZWZ0ID0gMzcsXHJcblx0UmlnaHQgPSAzOSxcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0IHtcclxuXHRwcml2YXRlIF9iaW5kaW5nczogeyBba2V5OiBzdHJpbmddOiBBY3Rpb24gfSA9IHtcclxuXHRcdFtLZXkuV106IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuQV06IEFjdGlvbi5MZWZ0LFxyXG5cdFx0W0tleS5TXTogQWN0aW9uLkRvd24sXHJcblx0XHRbS2V5LkRdOiBBY3Rpb24uUmlnaHQsXHJcblx0XHRbS2V5LlVwXTogQWN0aW9uLlVwLFxyXG5cdFx0W0tleS5Eb3duXTogQWN0aW9uLkRvd24sXHJcblx0XHRbS2V5LkxlZnRdOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuUmlnaHRdOiBBY3Rpb24uUmlnaHQsXHJcblx0fTtcclxuXHJcblx0cHVibGljIGFjdGlvbnM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcblx0cHJpdmF0ZSBfZ2FtZTogR2FtZTtcclxuXHRwcml2YXRlIF9tb3VzZVBvczogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cclxuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXHJcblx0XHRcdCdtb3VzZWRvd24nLFxyXG5cdFx0XHR0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcylcclxuXHRcdCk7XHJcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxyXG5cdFx0XHQnbW91c2V1cCcsXHJcblx0XHRcdHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcylcclxuXHRcdCk7XHJcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxyXG5cdFx0XHQnbW91c2Vtb3ZlJyxcclxuXHRcdFx0dGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcylcclxuXHRcdCk7XHJcblxyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duLmJpbmQodGhpcykpO1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLm9uS2V5VXAuYmluZCh0aGlzKSk7XHJcblx0fVxyXG5cclxuXHRiaW5kKGtleTogS2V5LCBhY3Rpb246IEFjdGlvbikge1xyXG5cdFx0dGhpcy51bmJpbmQoa2V5KTtcclxuXHJcblx0XHR0aGlzLl9iaW5kaW5nc1trZXldID0gYWN0aW9uO1xyXG5cdH1cclxuXHJcblx0dW5iaW5kKGtleTogS2V5KSB7XHJcblx0XHRpZiAodGhpcy5fYmluZGluZ3Nba2V5XSkge1xyXG5cdFx0XHRkZWxldGUgdGhpcy5fYmluZGluZ3Nba2V5XTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpIHtcclxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcclxuXHJcblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbktleVVwKGU6IEtleWJvYXJkRXZlbnQpIHtcclxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcclxuXHJcblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSBmYWxzZTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0dGhpcy5nZXRNb3VzZVBvc2l0aW9uKGUpO1xyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gdHJ1ZTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpIHtcclxuXHRcdGNvbnN0IGxlZnRCdXR0b24gPSAwO1xyXG5cclxuXHRcdGlmIChlLmJ1dHRvbiA9PSBsZWZ0QnV0dG9uKSB7XHJcblx0XHRcdHRoaXMuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVE9ETyA6IE5lZWRzIGJldHRlciBpbXBsZW1lbnRhdGlvblxyXG5cdHByaXZhdGUgZ2V0TW91c2VQb3NpdGlvbihlOiBNb3VzZUV2ZW50KSB7XHJcblx0XHRsZXQgY2FudmFzT2Zmc2V0ID0gdGhpcy5fZ2FtZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XHJcblx0XHRcdHg6IGUuY2xpZW50WCAtIGNhbnZhc09mZnNldC5sZWZ0LFxyXG5cdFx0XHR5OiBlLmNsaWVudFkgLSBjYW52YXNPZmZzZXQudG9wLFxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55LFxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55LFxyXG5cdFx0fTtcclxuXHR9XHJcbn1cclxuIiwiZXhwb3J0IGNsYXNzIE1hcCB7XHJcblx0cHVibGljIHdpZHRoOiBudW1iZXIgPSAyMDAwO1xyXG5cdHB1YmxpYyBoZWlnaHQ6IG51bWJlciA9IDE1MDA7XHJcbn1cclxuIiwiaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHR3byByZWN0YW5ndWxhciBib2RpZXMgaW50ZXJzZWN0XHJcblx0ICogQHBhcmFtICB7UmVjdH0gYm9keTEgRmlyc3QgYm9keSB3aXRoIHt4LHl9IHBvc2l0aW9uIGFuZCB7d2lkdGgsIGhlaWdodH1cclxuXHQgKiBAcGFyYW0gIHtSZWN0fSBib2R5MiBTZWNvbmQgYm9keVxyXG5cdCAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhleSBpbnRlcnNlY3QsIG90aGVyd2lzZSBmYWxzZVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBpbnRlcnNlY3RzKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSk6IGJvb2xlYW4ge1xyXG5cdFx0bGV0IGludGVyc2VjdGlvblggPVxyXG5cdFx0XHRib2R5MS5wb3NpdGlvbi54IDwgYm9keTIucG9zaXRpb24ueCArIGJvZHkyLndpZHRoICYmXHJcblx0XHRcdGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XHJcblxyXG5cdFx0bGV0IGludGVyc2VjdGlvblkgPVxyXG5cdFx0XHRib2R5MS5wb3NpdGlvbi55IDwgYm9keTIucG9zaXRpb24ueSArIGJvZHkyLmhlaWdodCAmJlxyXG5cdFx0XHRib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcclxuXHJcblx0XHRyZXR1cm4gaW50ZXJzZWN0aW9uWCAmJiBpbnRlcnNlY3Rpb25ZO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGNvbGxpZGUoXHJcblx0XHRib2R5MTogQm9keSxcclxuXHRcdGJvZHkyOiBCb2R5LFxyXG5cdFx0Y29sbGlzaW9uQ2FsbGJhY2s6IEZ1bmN0aW9uXHJcblx0KTogYm9vbGVhbiB7XHJcblx0XHRpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcclxuXHRcdFx0Y29sbGlzaW9uQ2FsbGJhY2soKTtcclxuXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRPdmVybGFwKGJvZHkxOiBCb2R5LCBib2R5MjogQm9keSk6IFZlY3RvciB7XHJcblx0XHRpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikgPT09IGZhbHNlKSB7XHJcblx0XHRcdHJldHVybiBWZWN0b3IuZnJvbSh7IHg6IDAsIHk6IDAgfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IG92ZXJsYXBYMSA9IGJvZHkyLnBvc2l0aW9uLnggLSAoYm9keTEucG9zaXRpb24ueCArIGJvZHkxLndpZHRoKTtcclxuXHRcdGxldCBvdmVybGFwWDIgPSBib2R5Mi5wb3NpdGlvbi54ICsgYm9keTIud2lkdGggLSBib2R5MS5wb3NpdGlvbi54O1xyXG5cclxuXHRcdGxldCBvdmVybGFwWTEgPSBib2R5Mi5wb3NpdGlvbi55IC0gKGJvZHkxLnBvc2l0aW9uLnkgKyBib2R5MS5oZWlnaHQpO1xyXG5cdFx0bGV0IG92ZXJsYXBZMiA9IGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQgLSBib2R5MS5wb3NpdGlvbi55O1xyXG5cclxuXHRcdGxldCBvdmVybGFwWCA9XHJcblx0XHRcdE1hdGguYWJzKG92ZXJsYXBYMSkgPCBNYXRoLmFicyhvdmVybGFwWDIpID8gb3ZlcmxhcFgxIDogb3ZlcmxhcFgyO1xyXG5cdFx0bGV0IG92ZXJsYXBZID1cclxuXHRcdFx0TWF0aC5hYnMob3ZlcmxhcFkxKSA8IE1hdGguYWJzKG92ZXJsYXBZMikgPyBvdmVybGFwWTEgOiBvdmVybGFwWTI7XHJcblxyXG5cdFx0cmV0dXJuIFZlY3Rvci5mcm9tKHsgeDogb3ZlcmxhcFgsIHk6IG92ZXJsYXBZIH0pO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBQb2ludCwgVmVjdG9yIH0gZnJvbSAnLi9wcmltaXRpdmVzJztcclxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBCdWxsZXQgfSBmcm9tICcuL2J1bGxldCc7XHJcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIgZXh0ZW5kcyBFbnRpdHkge1xyXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XHJcblx0cHJpdmF0ZSBfbGFzdFNob3Q6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0cHVibGljIGJvZHk6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKDEwLCAxMCksIDM2LCAzNik7XHJcblx0cHVibGljIHNwZWVkOiBudW1iZXIgPSAzO1xyXG5cdHB1YmxpYyBhdHRhY2tTcGVlZCA9IDE1MDtcclxuXHJcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbjtcclxuXHRwcml2YXRlIF9hbmltYXRpb25zOiB7IFtrZXk6IHN0cmluZ106IEFuaW1hdGlvbiB9ID0ge1xyXG5cdFx0aWRsZTogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRyaWdodDogbmV3IEFuaW1hdGlvbig0LCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXHJcblx0XHRsZWZ0OiBuZXcgQW5pbWF0aW9uKDQsIDEsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKSxcclxuXHR9O1xyXG5cdHByaXZhdGUgX2J1bGxldE9mZnNldDogUG9pbnQgPSB7IHg6IDEyLCB5OiAxOCB9O1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHJcblx0XHR0aGlzLmFuaW1hdGUoJ2lkbGUnKTtcclxuXHR9XHJcblxyXG5cdHNob290KCk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oXHJcblx0XHRcdFx0e30sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0eDogdGhpcy5ib2R5LnBvc2l0aW9uLnggKyB0aGlzLl9idWxsZXRPZmZzZXQueCxcclxuXHRcdFx0XHRcdHk6IHRoaXMuYm9keS5wb3NpdGlvbi55ICsgdGhpcy5fYnVsbGV0T2Zmc2V0LnksXHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0bGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoYnVsbGV0U3Bhd24sIHRoaXMuX2dhbWUubW91c2UsIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMucHVzaChidWxsZXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjYW5TaG9vdCgpOiBib29sZWFuIHtcclxuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb246IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTA7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwYXRlTW92ZW1lbnQoKTogdm9pZCB7XHJcblx0XHRsZXQgaW5wdXQgPSB0aGlzLl9nYW1lLmlucHV0O1xyXG5cclxuXHRcdGxldCBtb3ZpbmdYID0gaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0gfHwgaW5wdXQuYWN0aW9uc1tBY3Rpb24uUmlnaHRdO1xyXG5cdFx0bGV0IG1vdmluZ1kgPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0gfHwgaW5wdXQuYWN0aW9uc1tBY3Rpb24uRG93bl07XHJcblxyXG5cdFx0bGV0IHNwZWVkID1cclxuXHRcdFx0bW92aW5nWCAmJiBtb3ZpbmdZXHJcblx0XHRcdFx0PyBNYXRoLnNxcnQoKHRoaXMuc3BlZWQgKiB0aGlzLnNwZWVkKSAvIDIpXHJcblx0XHRcdFx0OiB0aGlzLnNwZWVkO1xyXG5cclxuXHRcdGxldCBkaXJlY3Rpb246IFZlY3RvciA9IG5ldyBWZWN0b3IoKTtcclxuXHJcblx0XHQoZGlyZWN0aW9uLnggPSBpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSA/IC0xIDogMSksXHJcblx0XHRcdChkaXJlY3Rpb24ueSA9IGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSA/IC0xIDogMSk7XHJcblxyXG5cdFx0ZGlyZWN0aW9uLnggPSBtb3ZpbmdYID8gZGlyZWN0aW9uLnggOiAwO1xyXG5cdFx0ZGlyZWN0aW9uLnkgPSBtb3ZpbmdZID8gZGlyZWN0aW9uLnkgOiAwO1xyXG5cclxuXHRcdHRoaXMuYm9keS52ZWxvY2l0eS54ID0gZGlyZWN0aW9uLnggKiBzcGVlZDtcclxuXHRcdHRoaXMuYm9keS52ZWxvY2l0eS55ID0gZGlyZWN0aW9uLnkgKiBzcGVlZDtcclxuXHJcblx0XHRjb25zb2xlLmxvZygnUGxheWVyIHNwZWVkOiAnICsgdGhpcy5ib2R5LnNwZWVkKTtcclxuXHJcblx0XHR0aGlzLmJvZHkudXBkYXRlKCk7XHJcblxyXG5cdFx0aWYgKGlucHV0LmFjdGlvbnNbQWN0aW9uLkF0dGFja10pIHtcclxuXHRcdFx0dGhpcy5zaG9vdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb24oKSB7XHJcblx0XHRsZXQgYW5pbWF0aW9uID1cclxuXHRcdFx0dGhpcy5fZ2FtZS5tb3VzZS54ID4gdGhpcy5ib2R5LnBvc2l0aW9uLnggPyAncmlnaHQnIDogJ2xlZnQnO1xyXG5cclxuXHRcdHRoaXMuYW5pbWF0ZShhbmltYXRpb24pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuYWxpdmUpIHtcclxuXHRcdFx0dGhpcy51cGF0ZU1vdmVtZW50KCk7XHJcblx0XHRcdHRoaXMudXBkYXRlQW5pbWF0aW9uKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsImV4cG9ydCBpbnRlcmZhY2UgUG9pbnQge1xyXG5cdHg6IG51bWJlcjtcclxuXHR5OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XHJcblx0eDogbnVtYmVyO1xyXG5cdHk6IG51bWJlcjtcclxuXHR3aWR0aDogbnVtYmVyO1xyXG5cdGhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVmVjdG9yIHtcclxuXHR4OiBudW1iZXIgPSAwO1xyXG5cdHk6IG51bWJlciA9IDA7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHtcclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCh2YWx1ZTogbnVtYmVyIHwgVmVjdG9yKTogdm9pZCB7XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG5cdFx0XHR0aGlzLnggPSB0aGlzLnkgPSB2YWx1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMueCA9IHZhbHVlLng7XHJcblx0XHRcdHRoaXMueSA9IHZhbHVlLnk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgY2xvbmUoKTogVmVjdG9yIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBtYWduaXR1ZGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBhZGQodmVjMTogVmVjdG9yLCB2ZWMyOiBWZWN0b3IpOiBWZWN0b3Ige1xyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodmVjMS54ICsgdmVjMi54LCB2ZWMxLnkgKyB2ZWMyLnkpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIHN1YnRyYWN0KHZlYzE6IFZlY3RvciwgdmVjMjogVmVjdG9yKTogVmVjdG9yIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYzEueCAtIHZlYzIueCwgdmVjMS55IC0gdmVjMi55KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBtdWx0aXBseSh2ZWM6IFZlY3Rvciwgc2NhbGFyOiBudW1iZXIpIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHZlYy54ICogc2NhbGFyLCB2ZWMueSAqIHNjYWxhcik7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZnJvbShwb2ludDogUG9pbnQpIHtcclxuXHRcdHJldHVybiBuZXcgVmVjdG9yKHBvaW50LngsIHBvaW50LnkpO1xyXG5cdH1cclxufVxyXG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbn1cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBvaW50LCBWZWN0b3IgfSBmcm9tICcuL3ByaW1pdGl2ZXMnO1xyXG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcclxuXHRwcml2YXRlIF9nYW1lOiBHYW1lO1xyXG5cclxuXHRwcml2YXRlIF90aWxlID0ge1xyXG5cdFx0d2lkdGg6IDMwLFxyXG5cdFx0aGVpZ2h0OiAzMCxcclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKlx0U3ByaXRlcyBJIHVzZSBmb3IgYSBkZXZlbG9wbWVudCB3ZXJlIGNyZWF0ZWQgYnkgQ29keSBTaGVwcCBmb3IgaGlzIGdhbWUgRGVudGFsIERlZmVuZGVyOiBTYWdhIG9mIHRoZSBDYW5keSBIb3JkZS5cclxuXHQgKlx0UGxlYXNlIGNoZWNrIGhpcyBnaXRodWIgcmVwbzogaHR0cHM6Ly9naXRodWIuY29tL2NzaGVwcC9jYW5keWphbS9cclxuXHQgKi9cclxuXHRwcml2YXRlIF9yZXNvdXJjZXMgPSB7XHJcblx0XHRwbGF5ZXI6ICcuL2ltZy9wbGF5ZXIucG5nJyxcclxuXHRcdGVuZW15OiAnLi9pbWcvZW5lbXkucG5nJyxcclxuXHRcdGJ1bGxldDogJy4vaW1nL2J1bGxldC5wbmcnLFxyXG5cdFx0d2FsbDogJy4vaW1nL3RyZWUtcmVkLTEucG5nJyxcclxuXHR9O1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlclRpbGUocG9zOiBQb2ludCwgY29sb3I6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LnJlY3QoXHJcblx0XHRcdHBvcy54LFxyXG5cdFx0XHRwb3MueSxcclxuXHRcdFx0dGhpcy5fdGlsZS53aWR0aCxcclxuXHRcdFx0dGhpcy5fdGlsZS5oZWlnaHRcclxuXHRcdCk7XHJcblx0XHR0aGlzLl9nYW1lLmNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XHJcblx0XHR0aGlzLl9nYW1lLmNvbnRleHQuZmlsbCgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJUaWxlcygpOiB2b2lkIHtcclxuXHRcdGxldCBjb2xvcnMgPSBbJyM3ODVjOTgnLCAnIzY5NGY4OCddO1xyXG5cclxuXHRcdGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5fZ2FtZS5tYXAud2lkdGg7IHggKz0gdGhpcy5fdGlsZS53aWR0aCkge1xyXG5cdFx0XHRmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuX2dhbWUubWFwLmhlaWdodDsgeSArPSB0aGlzLl90aWxlLmhlaWdodCkge1xyXG5cdFx0XHRcdGxldCB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcclxuXHRcdFx0XHRsZXQgeUluZGV4ID0gKHkgLyB0aGlzLl90aWxlLmhlaWdodCkgJSAyO1xyXG5cclxuXHRcdFx0XHRsZXQgdGlsZVBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KHsgeCwgeSB9KTtcclxuXHJcblx0XHRcdFx0dGhpcy5yZW5kZXJUaWxlKHRpbGVQb3MsIGNvbG9yc1t4SW5kZXggXiB5SW5kZXhdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjYW1lcmFPZmZzZXQocG9zOiBQb2ludCk6IFBvaW50IHtcclxuXHRcdGxldCBzZWxmID0gdGhpcztcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuXHRcdFx0eTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnksXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJIZWxwZXIoc291cmNlOiBzdHJpbmcsIGNvbGxlY3Rpb246IEVudGl0eVtdKSB7XHJcblx0XHRsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcblx0XHRpbWcuc3JjID0gc291cmNlO1xyXG5cclxuXHRcdGNvbGxlY3Rpb24uZm9yRWFjaCgoZSkgPT4ge1xyXG5cdFx0XHRsZXQgZnJhbWUgPSBlLmN1cnJlbnRBbmltYXRpb24uY3VycmVudEZyYW1lO1xyXG5cdFx0XHRsZXQgcG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoZS5ib2R5LnBvc2l0aW9uKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLl9nYW1lLmNvbmZpZy5zaG93QUFCQikge1xyXG5cdFx0XHRcdHRoaXMucmVuZGVyQUFCQihcclxuXHRcdFx0XHRcdG5ldyBCb2R5KFxyXG5cdFx0XHRcdFx0XHRuZXcgVmVjdG9yKHBvcy54LCBwb3MueSksXHJcblx0XHRcdFx0XHRcdGUuYm9keS53aWR0aCxcclxuXHRcdFx0XHRcdFx0ZS5ib2R5LmhlaWdodFxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2dhbWUuY29udGV4dC5kcmF3SW1hZ2UoXHJcblx0XHRcdFx0aW1nLFxyXG5cdFx0XHRcdGZyYW1lLngsXHJcblx0XHRcdFx0ZnJhbWUueSxcclxuXHRcdFx0XHRmcmFtZS53aWR0aCxcclxuXHRcdFx0XHRmcmFtZS5oZWlnaHQsXHJcblx0XHRcdFx0cG9zLngsXHJcblx0XHRcdFx0cG9zLnksXHJcblx0XHRcdFx0ZnJhbWUud2lkdGgsXHJcblx0XHRcdFx0ZnJhbWUuaGVpZ2h0XHJcblx0XHRcdCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIHRvZG86IGV4dHJhY3QgaHAtYmFyIHJlbmRlcmluZyBsb2dpY1xyXG5cdHByaXZhdGUgcmVuZGVySHVkKCk6IHZvaWQge1xyXG5cdFx0bGV0IG9mZnNldCA9IDIwO1xyXG5cclxuXHRcdGxldCBiYXJTaXplID0geyB3aWR0aDogMTUwLCBoZWlnaHQ6IDEwIH07XHJcblx0XHRsZXQgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xyXG5cclxuXHRcdGN0eC5iZWdpblBhdGgoKTtcclxuXHRcdGN0eC5yZWN0KFxyXG5cdFx0XHRvZmZzZXQsXHJcblx0XHRcdHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCAtIG9mZnNldCAqIDEuMixcclxuXHRcdFx0YmFyU2l6ZS53aWR0aCxcclxuXHRcdFx0YmFyU2l6ZS5oZWlnaHRcclxuXHRcdCk7XHJcblxyXG5cdFx0dmFyIGdyZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudChcclxuXHRcdFx0b2Zmc2V0LFxyXG5cdFx0XHR0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQgLSBvZmZzZXQsXHJcblx0XHRcdG9mZnNldCArIGJhclNpemUud2lkdGgsXHJcblx0XHRcdHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodCAtIG9mZnNldCArIGJhclNpemUuaGVpZ2h0XHJcblx0XHQpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgwLCAnIzRjYWY1MCcpO1xyXG5cdFx0Z3JkLmFkZENvbG9yU3RvcCh0aGlzLl9nYW1lLnBsYXllci5oZWFsdGggLyAxMDAsICcjNGNhZjUwJyk7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKHRoaXMuX2dhbWUucGxheWVyLmhlYWx0aCAvIDEwMCwgJ2JsYWNrJyk7XHJcblx0XHRncmQuYWRkQ29sb3JTdG9wKDEsICdibGFjaycpO1xyXG5cclxuXHRcdGN0eC5maWxsU3R5bGUgPSBncmQ7XHJcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnIzE4MjUyNCc7XHJcblx0XHRjdHgubGluZVdpZHRoID0gMTtcclxuXHRcdGN0eC5maWxsKCk7XHJcblx0XHRjdHguc3Ryb2tlKCk7XHJcblxyXG5cdFx0Y3R4LmZvbnQgPSAnMjBweCBDb25zb2xhcyc7XHJcblx0XHRjdHguZmlsbFN0eWxlID0gJyNmNmU4NTUnO1xyXG5cdFx0Y3R4LmZpbGxUZXh0KFxyXG5cdFx0XHR0aGlzLl9nYW1lLnNjb3JlLnRvU3RyaW5nKCksXHJcblx0XHRcdG9mZnNldCxcclxuXHRcdFx0dGhpcy5fZ2FtZS5jYW52YXMuaGVpZ2h0IC0gb2Zmc2V0ICogMS41XHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJBQUJCKGJvZHk6IEJvZHkpIHtcclxuXHRcdGxldCBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XHJcblxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnRyYW5zbGF0ZSgwLjUsIDAuNSk7XHJcblx0XHRjdHgucmVjdChib2R5LnBvc2l0aW9uLngsIGJvZHkucG9zaXRpb24ueSwgYm9keS53aWR0aCwgYm9keS5oZWlnaHQpO1xyXG5cclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnO1xyXG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcblx0XHRjdHguc3Ryb2tlKCk7XHJcblx0XHRjdHgudHJhbnNsYXRlKC0wLjUsIC0wLjUpO1xyXG5cdH1cclxuXHJcblx0cmVuZGVyKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5jbGVhcigpO1xyXG5cclxuXHRcdHRoaXMucmVuZGVyVGlsZXMoKTtcclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snYnVsbGV0J10sIHRoaXMuX2dhbWUuYnVsbGV0cyk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2VuZW15J10sIHRoaXMuX2dhbWUuZW5lbWllcyk7XHJcblxyXG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydwbGF5ZXInXSwgW3RoaXMuX2dhbWUucGxheWVyXSk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ3dhbGwnXSwgdGhpcy5fZ2FtZS53YWxscyk7XHJcblx0XHR0aGlzLnJlbmRlckh1ZCgpO1xyXG5cdH1cclxuXHJcblx0Y2xlYXIoKTogdm9pZCB7XHJcblx0XHRsZXQgdyA9IHRoaXMuX2dhbWUuY2FudmFzLndpZHRoO1xyXG5cdFx0bGV0IGggPSB0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQ7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBVcGRhdGVyIHtcclxuXHRwcml2YXRlIF9nYW1lOiBHYW1lO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFsbEVudGl0aWVzKCk6IEVudGl0eVtdIHtcclxuXHRcdHJldHVybiA8RW50aXR5W10+KFxyXG5cdFx0XHRBcnJheS5wcm90b3R5cGUuY29uY2F0KFxyXG5cdFx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cyxcclxuXHRcdFx0XHR0aGlzLl9nYW1lLmVuZW1pZXMsXHJcblx0XHRcdFx0dGhpcy5fZ2FtZS5wbGF5ZXJcclxuXHRcdFx0KVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9ucygpOiB2b2lkIHtcclxuXHRcdGxldCBlbnRpdGllcyA9IHRoaXMuYWxsRW50aXRpZXMoKTtcclxuXHJcblx0XHRlbnRpdGllcy5mb3JFYWNoKChlKSA9PiB7XHJcblx0XHRcdGUuY3VycmVudEFuaW1hdGlvbi51cGRhdGUodGhpcy5fZ2FtZS5nYW1lVGltZSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlRW50aXRpZXMoKTogdm9pZCB7XHJcblx0XHRsZXQgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaCgoZSkgPT4ge1xyXG5cdFx0XHRlLnVwZGF0ZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZURlYWQoKTogdm9pZCB7XHJcblx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaCgoZSkgPT4ge1xyXG5cdFx0XHR0aGlzLnJlbW92ZURlYWQoZSwgdGhpcy5fZ2FtZS5idWxsZXRzKTtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGUpID0+IHtcclxuXHRcdFx0dGhpcy5yZW1vdmVEZWFkKGUsIHRoaXMuX2dhbWUuZW5lbWllcyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVtb3ZlRGVhZChlOiBFbnRpdHksIGNvbGxlY3Rpb246IEVudGl0eVtdKSB7XHJcblx0XHRpZiAoZS5hbGl2ZSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0bGV0IGVJbmRleCA9IGNvbGxlY3Rpb24uaW5kZXhPZihlKTtcclxuXHJcblx0XHRcdGlmIChlSW5kZXggPiAtMSkge1xyXG5cdFx0XHRcdGNvbGxlY3Rpb24uc3BsaWNlKGVJbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpOiB2b2lkIHtcclxuXHRcdHRoaXMudXBkYXRlQW5pbWF0aW9ucygpO1xyXG5cdFx0dGhpcy51cGRhdGVFbnRpdGllcygpO1xyXG5cdFx0dGhpcy51cGRhdGVEZWFkKCk7XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnRhcmdldCA9IHRoaXMuX2dhbWUucGxheWVyLmJvZHkucG9zaXRpb247XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jb2xsaXNpb25zLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5pbnB1dC51cGRhdGUoKTtcclxuXHR9XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKSB7fVxyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG5cdHN0YXRpYyBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0aWYgKHZhbHVlID4gbWF4KSB7XHJcblx0XHRcdHJldHVybiBtYXg7XHJcblx0XHR9XHJcblx0XHRpZiAodmFsdWUgPCBtaW4pIHtcclxuXHRcdFx0cmV0dXJuIG1pbjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcclxuXHRwdWJsaWMgdGFyZ2V0OiBQb2ludDtcclxuXHRwdWJsaWMgcG9zaXRpb246IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XHJcblx0cHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcclxuXHRwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xyXG5cdFx0dGhpcy5faGVpZ2h0ID0gZ2FtZUluc3RhbmNlLmNhbnZhcy5oZWlnaHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhbGN1bGF0ZVBvc2l0aW9uKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcChcclxuXHRcdFx0dGhpcy50YXJnZXQueCAtIHRoaXMuX3dpZHRoIC8gMixcclxuXHRcdFx0MCxcclxuXHRcdFx0dGhpcy5fZ2FtZS5tYXAud2lkdGggLSB0aGlzLl93aWR0aFxyXG5cdFx0KTtcclxuXHRcdHRoaXMucG9zaXRpb24ueSA9IFV0aWwuY2xhbXAoXHJcblx0XHRcdHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLFxyXG5cdFx0XHQwLFxyXG5cdFx0XHR0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHRcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKTogdm9pZCB7XHJcblx0XHR0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuaW1wb3J0IHsgUG9pbnQsIFZlY3RvciB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgV2FsbCBleHRlbmRzIEVudGl0eSB7XHJcblx0cHVibGljIGJvZHk6IEJvZHkgPSBuZXcgQm9keShuZXcgVmVjdG9yKCksIDE1MSwgMjExKTtcclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDE1MSwgMjExKSk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuYm9keS5wb3NpdGlvbiA9IFZlY3Rvci5mcm9tKHBvc2l0aW9uKTtcclxuXHR9XHJcbn1cclxuIl19
