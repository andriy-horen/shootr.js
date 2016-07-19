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
class Body {
    constructor(position, width, height) {
        this.velocity = { x: 0, y: 0 };
        this.position = position;
        this.width = width;
        this.height = height;
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
exports.Body = Body;
},{}],3:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const body_1 = require('./body');
const animation_1 = require('./animation');
const frame_1 = require('./frame');
class Bullet extends entity_1.Entity {
    constructor(position, target, parent) {
        super();
        this.speed = 10;
        this.damageAmount = 10;
        this.body = new body_1.Body({ x: 0, y: 0 }, 3, 3);
        this.currentAnimation = new animation_1.Animation(1, 0, frame_1.Frame.create(0, 0, 10, 10));
        this.body.position = position;
        this.target = target;
        this.parent = parent;
        this.setVelocity(this.target);
    }
    setVelocity(position) {
        var dx = Math.abs(position.x - this.body.position.x);
        var dy = Math.abs(position.y - this.body.position.y);
        var dirX = position.x - this.body.position.x > 0 ? 1 : -1;
        var dirY = position.y - this.body.position.y > 0 ? 1 : -1;
        var x = dx * (this.speed / (dx + dy)) * dirX;
        var y = dy * (this.speed / (dx + dy)) * dirY;
        this.body.velocity = { x: x, y: y };
    }
    update() {
        this.body.update();
    }
}
exports.Bullet = Bullet;
},{"./animation":1,"./body":2,"./entity":7,"./frame":8}],4:[function(require,module,exports){
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
        this.body = new body_1.Body({ x: 100, y: 100 }, 36, 36);
        this.target = target;
        this.animate('right');
    }
    animate(animation) {
        this.currentAnimation = this._animations[animation];
        this.currentAnimation.speed = 1;
    }
    moveTowards(position) {
        var dx = Math.abs(position.x - this.body.position.x);
        var dy = Math.abs(position.y - this.body.position.y);
        var dirX = position.x - this.body.position.x > 0 ? 1 : -1;
        var dirY = position.y - this.body.position.y > 0 ? 1 : -1;
        var velX = dx * (this.speed / (dx + dy)) * dirX;
        var velY = dy * (this.speed / (dx + dy)) * dirY;
        this.body.position.x += velX;
        this.body.position.y += velY;
        if (dirX > 0) {
            this.animate('right');
        }
        else {
            this.animate('left');
        }
    }
    update() {
        this.moveTowards(this.target.body.position);
    }
}
exports.Enemy = Enemy;
},{"./animation":1,"./body":2,"./entity":7,"./frame":8}],7:[function(require,module,exports){
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
        var frame = new Frame();
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
        this.config = config;
        this.canvas = document.querySelector(config.container);
        this.context = this.canvas.getContext('2d');
        this.player = new player_1.Player(this);
        this.map = new map_1.Map();
        this.input = new input_1.Input(this);
        this.viewport = new viewport_1.Viewport(this);
        this.viewport.target = this.player.body.position;
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
var game = new Game({
    container: '.game',
    showAABB: false
});
game.run();
},{"./collision-manager":4,"./enemy":6,"./input":10,"./map":11,"./player":13,"./renderer":14,"./updater":15,"./viewport":17}],10:[function(require,module,exports){
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
        var canvasOffset = this._game.canvas.getBoundingClientRect();
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
        var intersectionX = body1.position.x < body2.position.x + body2.width
            && body1.position.x + body1.width > body2.position.x;
        var intersectionY = body1.position.y < body2.position.y + body2.height
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
const input_1 = require('./input');
const body_1 = require('./body');
const bullet_1 = require('./bullet');
const frame_1 = require('./frame');
const animation_1 = require('./animation');
const util_1 = require('./util');
class Player extends entity_1.Entity {
    constructor(gameInstance) {
        super();
        this._lastShot = new Date(0);
        this.body = new body_1.Body({ x: 10, y: 10 }, 36, 36);
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
            let bulletSpawn = Object.assign({}, util_1.Util.addPoint(this.body.position, this._bulletOffset));
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
        if (input.actions[input_1.Action.Left]) {
            this.body.position.x -= this.speed;
            this.animate('left');
        }
        else if (input.actions[input_1.Action.Right]) {
            this.body.position.x += this.speed;
            this.animate('right');
        }
        if (input.actions[input_1.Action.Up]) {
            this.body.position.y -= this.speed;
        }
        else if (input.actions[input_1.Action.Down]) {
            this.body.position.y += this.speed;
        }
        if (input.actions[input_1.Action.Attack]) {
            this.shoot();
        }
    }
    update() {
        this.upateMovement();
    }
}
exports.Player = Player;
},{"./animation":1,"./body":2,"./bullet":3,"./entity":7,"./frame":8,"./input":10,"./util":16}],14:[function(require,module,exports){
"use strict";
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
        var colors = ["#785c98", "#694f88"];
        for (var x = 0; x < this._game.map.width; x += this._tile.width) {
            for (var y = 0; y < this._game.map.height; y += this._tile.height) {
                var xIndex = (x / this._tile.width) % 2;
                var yIndex = (y / this._tile.height) % 2;
                var tilePos = this.cameraOffset({ x: x, y: y });
                this.renderTile(tilePos, colors[xIndex ^ yIndex]);
            }
        }
    }
    cameraOffset(pos) {
        var self = this;
        return {
            x: pos.x - self._game.viewport.position.x,
            y: pos.y - self._game.viewport.position.y
        };
    }
    renderHelper(source, collection) {
        let img = document.createElement('img');
        img.src = source;
        collection.forEach((e) => {
            var frame = e.currentAnimation.currentFrame;
            var pos = this.cameraOffset(e.body.position);
            if (this._game.config.showAABB) {
                this.renderAABB(new body_1.Body(pos, e.body.width, e.body.height));
            }
            this._game.context.drawImage(img, frame.x, frame.y, frame.width, frame.height, pos.x, pos.y, frame.width, frame.height);
        });
    }
    renderAABB(body) {
        var ctx = this._game.context;
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
},{"./body":2}],15:[function(require,module,exports){
"use strict";
class Updater {
    constructor(gameInstance) {
        this._game = gameInstance;
    }
    allEntities() {
        return Array.prototype.concat(this._game.bullets, this._game.enemies, this._game.player);
    }
    updateAnimations() {
        var entities = this.allEntities();
        entities.forEach((e) => { e.currentAnimation.update(this._game.gameTime); });
    }
    updateEntities() {
        var entities = this.allEntities();
        entities.forEach(e => { e.update(); });
    }
    updateDead() {
        this._game.bullets.forEach(e => { this.removeDead(e, this._game.bullets); });
        this._game.enemies.forEach(e => { this.removeDead(e, this._game.enemies); });
    }
    removeDead(e, collection) {
        if (e.alive === false) {
            var eIndex = collection.indexOf(e);
            if (eIndex > -1) {
                collection.splice(eIndex, 1);
            }
        }
    }
    update() {
        this.updateAnimations();
        this.updateEntities();
        this.updateDead();
        this._game.viewport.update();
        this._game.collisions.update();
        this._game.input.update();
    }
}
exports.Updater = Updater;
},{}],16:[function(require,module,exports){
"use strict";
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
    static addPoint(point1, point2) {
        return {
            x: point1.x + point2.x,
            y: point1.y + point2.y
        };
    }
}
exports.Util = Util;
},{}],17:[function(require,module,exports){
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
},{"./util":16}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2NvbnN0LnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9yZW5kZXJlci50cyIsInNyYy9qcy91cGRhdGVyLnRzIiwic3JjL2pzL3V0aWwudHMiLCJzcmMvanMvdmlld3BvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQ0EsTUFBWSxLQUFLLFdBQU0sU0FBUyxDQUFDLENBQUE7QUFFakM7SUFrQkMsWUFBWSxNQUFjLEVBQUUsR0FBVyxFQUFFLEtBQVk7UUFYOUMsVUFBSyxHQUFZLENBQUMsQ0FBQztRQUtuQixTQUFJLEdBQVksSUFBSSxDQUFDO1FBRXBCLGtCQUFhLEdBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFLMUMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUM1RCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVc7UUFDckIsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUks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QUVyQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU8sV0FBVyxDQUFDLFFBQWU7UUFDNUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTdDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBQSxDQUFDLEVBQUUsR0FBQSxDQUFDLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsTUFBTTtRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDcEIsQ0FBQztBQUNGLENBQUM7QUFsQ1ksY0FBTSxTQWtD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RTlCO0lBUUMsWUFBWSxZQUFrQjtRQU52QixhQUFRLEdBQVUsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQztRQU96QyxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDM0MsQ0FBQztJQUVPLGlCQUFpQjtRQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxXQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0FBQ0YsQ0FBQztBQXRCWSxnQkFBUSxXQXNCcEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0ICogYXMgQ29uc3QgZnJvbSAnLi9jb25zdCc7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuXHRwdWJsaWMgY3VycmVudEZyYW1lIDogRnJhbWU7XG5cblx0LyoqXG5cdCAqIE51bWJlciBvZiBmcmFtZXMgcGVyIHNlY29uZFxuXHQgKiBAdHlwZSB7bnVtYmVyfVxuXHQgKi9cblx0cHVibGljIHNwZWVkIDogbnVtYmVyID0gMDtcblx0LyoqICFOT1QgSU1QTEVNRVRFRCBZRVQhXG5cdCAqIFNldCB0byB0cnVlIHRvIG1ha2UgYW5pbWF0aW9uIGxvb3BlZCwgZmFsc2UgLSBmb3Igb25lIGN5Y2xlIG9ubHlcblx0ICogQHR5cGUge2Jvb2xlYW59XG5cdCAqL1xuXHRwdWJsaWMgbG9vcDogYm9vbGVhbiA9IHRydWU7XG5cblx0cHJpdmF0ZSBfbGFzdEFuaW1hdGVkIDogRGF0ZSA9IG5ldyBEYXRlKDApO1xuXHRwcml2YXRlIF9yb3cgOiBudW1iZXI7XG5cdHByaXZhdGUgX2xlbmd0aCA6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihsZW5ndGg6IG51bWJlciwgcm93OiBudW1iZXIsIGZyYW1lOiBGcmFtZSkge1xuXHRcdHRoaXMuX3JvdyA9IHJvdztcblx0XHR0aGlzLl9sZW5ndGggPSBsZW5ndGg7XG5cblx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IGZyYW1lO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLnkgPSB0aGlzLl9yb3cgKiB0aGlzLmN1cnJlbnRGcmFtZS5oZWlnaHQ7XG5cdH1cblxuXHRjYW5BbmltYXRlKHRpbWUgOiBEYXRlKSA6IGJvb2xlYW4ge1xuXHRcdGxldCBhbmltYXRpb25EZWx0YSA9IHRpbWUuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdEFuaW1hdGVkLmdldFRpbWUoKTtcblxuXHRcdHJldHVybiBhbmltYXRpb25EZWx0YSA+IHRoaXMuZGVsYXk7XG5cdH1cblxuXHRnZXQgZGVsYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gQ29uc3QuTVNfSU5fU0VDIC8gdGhpcy5zcGVlZDtcblx0fVxuXG5cdG5leHQoKSB7XG5cdFx0bGV0IGluZGV4ID0gdGhpcy5jdXJyZW50RnJhbWUuaW5kZXg7XG5cblx0XHRpbmRleCA9IChpbmRleCArIDEpICUgdGhpcy5fbGVuZ3RoO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLmluZGV4ID0gaW5kZXg7XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUueCA9IGluZGV4ICogdGhpcy5jdXJyZW50RnJhbWUud2lkdGg7XG5cdH1cblxuXHR1cGRhdGUoZ2FtZVRpbWU6IERhdGUpIHtcblx0XHRpZiAodGhpcy5jYW5BbmltYXRlKGdhbWVUaW1lKSkge1xuXHRcdFx0dGhpcy5fbGFzdEFuaW1hdGVkID0gZ2FtZVRpbWU7XG5cblx0XHRcdHRoaXMubmV4dCgpO1xuXHRcdH1cblx0fVxuXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IG5ldyBEYXRlKDApO1xuXHRcdHRoaXMuY3VycmVudEZyYW1lLmluZGV4ID0gMDtcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS54ID0gMDtcblx0fVxufVxuIiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcblxuZXhwb3J0IGNsYXNzIEJvZHkge1xuXHRwb3NpdGlvbiA6IFBvaW50O1xuXHR2ZWxvY2l0eTogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcblxuXHR3aWR0aCA6IG51bWJlcjtcblx0aGVpZ2h0IDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMucG9zaXRpb24ueCArPSB0aGlzLnZlbG9jaXR5Lng7XG5cdFx0dGhpcy5wb3NpdGlvbi55ICs9IHRoaXMudmVsb2NpdHkueTtcblx0fVxufSIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XG5cbmV4cG9ydCBjbGFzcyBCdWxsZXQgZXh0ZW5kcyBFbnRpdHkge1xuXHRwdWJsaWMgdGFyZ2V0IDogUG9pbnQ7XG5cdHB1YmxpYyBwYXJlbnQgOiBFbnRpdHk7XG5cdHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDEwO1xuXHRwdWJsaWMgZGFtYWdlQW1vdW50IDogbnVtYmVyID0gMTA7XG5cdHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KHsgeDogMCwgeTogMH0sIDMsIDMpO1xuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMTAsIDEwKSk7XG5cblx0Y29uc3RydWN0b3IocG9zaXRpb246IFBvaW50LCB0YXJnZXQ6IFBvaW50LCBwYXJlbnQgOiBFbnRpdHkpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5ib2R5LnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cblx0XHR0aGlzLnNldFZlbG9jaXR5KHRoaXMudGFyZ2V0KTtcblx0fVxuXG5cdHByaXZhdGUgc2V0VmVsb2NpdHkocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHZhciBkaXJYID0gcG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54ID4gMCA/IDEgOiAtMTtcbiAgICAgICAgdmFyIGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xuXG4gICAgICAgIHZhciB4ID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xuICAgICAgICB2YXIgeSA9IGR5ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWTtcblxuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkgPSB7IHgsIHkgfTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5ib2R5LnVwZGF0ZSgpO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IFBoeXNpY3MgfSBmcm9tICcuL3BoeXNpY3MnO1xuXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uTWFuYWdlciB7IFxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaCgoYnVsbGV0KSA9PiB7XG5cdFx0XHRcdFBoeXNpY3MuY29sbGlkZShlbmVteS5ib2R5LCBidWxsZXQuYm9keSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGVuZW15LmRhbWFnZShidWxsZXQuZGFtYWdlQW1vdW50LCBidWxsZXQucGFyZW50KTtcblxuXHRcdFx0XHRcdGJ1bGxldC5raWxsKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cbn0iLCJleHBvcnQgY29uc3QgTVNfSU5fU0VDID0gMTAwMDtcbiIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5cbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBFbmVteSBleHRlbmRzIEVudGl0eSB7XG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcblx0XHRcdCdpZGxlJyA6IG5ldyBBbmltYXRpb24oMSwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHRcdFx0J3JpZ2h0JyA6IG5ldyBBbmltYXRpb24oNCwgMCwgRnJhbWUuY3JlYXRlKDAsIDAsIDM2LCAzNikpLFxuXHRcdFx0J2xlZnQnIDogbmV3IEFuaW1hdGlvbig0LCAxLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSlcbiAgICB9O1xuXG4gICAgcHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG4gICAgcHVibGljIHNwZWVkIDogbnVtYmVyID0gMztcbiAgICBwdWJsaWMgdGFyZ2V0IDogRW50aXR5O1xuICAgIHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KHsgeDogMTAwLCB5OiAxMDAgfSwgMzYsIDM2KTtcblxuXHRjb25zdHJ1Y3Rvcih0YXJnZXQ6IEVudGl0eSkge1xuXHRcdHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XG5cdH1cblxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZykgOiB2b2lkIHtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25zW2FuaW1hdGlvbl07XG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTtcblx0fVxuXG5cdG1vdmVUb3dhcmRzKHBvc2l0aW9uOiBQb2ludCkgOiB2b2lkIHtcbiAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcbiAgICAgICAgdmFyIGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcblxuICAgICAgICB2YXIgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XG4gICAgICAgIHZhciBkaXJZID0gcG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55ID4gMCA/IDEgOiAtMTtcblxuICAgICAgICB2YXIgdmVsWCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcbiAgICAgICAgdmFyIHZlbFkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XG5cbiAgICAgICAgdGhpcy5ib2R5LnBvc2l0aW9uLnggKz0gdmVsWDtcbiAgICAgICAgdGhpcy5ib2R5LnBvc2l0aW9uLnkgKz0gdmVsWTtcblxuXG4gICAgICAgIGlmIChkaXJYID4gMCkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdsZWZ0Jyk7XG4gICAgICAgIH1cblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5tb3ZlVG93YXJkcyh0aGlzLnRhcmdldC5ib2R5LnBvc2l0aW9uKTtcblx0fVxufVxuIiwiaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHkge1xuXHRwcml2YXRlIF9oZWFsdGggOiBudW1iZXIgPSAxMDA7XG5cdHByaXZhdGUgX2FsaXZlIDogYm9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2F0dGFja2VyIDogRW50aXR5O1xuXG5cdHB1YmxpYyBib2R5IDogQm9keTtcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG5cblx0Z2V0IGhlYWx0aCgpIDogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5faGVhbHRoO1xuXHR9XG5cblx0Z2V0IGFsaXZlKCkgOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fYWxpdmU7XG5cdH1cblxuXHRwcml2YXRlIF9zZXRIZWFsdGgobnVtYmVyOiBudW1iZXIpIHtcblx0XHRpZiAodGhpcy5faGVhbHRoID4gMCAmJiB0aGlzLl9hbGl2ZSkge1xuXHRcdFx0dGhpcy5faGVhbHRoICs9IG51bWJlcjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faGVhbHRoIDw9IDApIHtcblx0XHRcdHRoaXMua2lsbCgpO1xuXHRcdH1cblx0fVxuXG5cdGtpbGwoKSB7XG5cdFx0dGhpcy5faGVhbHRoID0gMDtcblx0XHR0aGlzLl9hbGl2ZSA9IGZhbHNlO1xuXHR9XG5cblx0ZGFtYWdlKGFtb3VudCA6IG51bWJlciwgYXR0YWNrZXI6IEVudGl0eSkgOiB2b2lkIHtcblx0XHR0aGlzLl9zZXRIZWFsdGgoLWFtb3VudCk7XG5cblx0XHR0aGlzLl9hdHRhY2tlciA9IGF0dGFja2VyO1xuXHR9XG5cblx0aGVhbChhbW91bnQgOiBudW1iZXIpIHtcblx0XHR0aGlzLl9zZXRIZWFsdGgoYW1vdW50KTtcblx0fVxuXG5cdHVwZGF0ZSgpIHt9XG59IiwiaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xuXG5leHBvcnQgY2xhc3MgRnJhbWUge1xuXHRpbmRleCA6IG51bWJlciA9IDA7XG5cdHg6IG51bWJlciA9IDA7XG5cdHk6IG51bWJlciA9IDA7XG5cdHdpZHRoOiBudW1iZXIgPSAwO1xuXHRoZWlnaHQ6IG51bWJlciA9IDA7XG5cdG5hbWUgOiBzdHJpbmc7XG5cblx0c3RhdGljIGNyZWF0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBGcmFtZSB7XG5cdFx0dmFyIGZyYW1lID0gbmV3IEZyYW1lKCk7XG5cblx0XHRmcmFtZS54ID0geDtcblx0XHRmcmFtZS55ID0geTtcblx0XHRmcmFtZS53aWR0aCA9IHdpZHRoO1xuXHRcdGZyYW1lLmhlaWdodCA9IGhlaWdodDtcblx0XHRmcmFtZS5uYW1lID0gbmFtZTtcblxuXHRcdHJldHVybiBmcmFtZTtcblx0fVxufVxuIiwiaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xuaW1wb3J0IHsgQ29sbGlzaW9uTWFuYWdlciB9IGZyb20gJy4vY29sbGlzaW9uLW1hbmFnZXInO1xuaW1wb3J0IHsgRW5lbXkgfSBmcm9tICcuL2VuZW15JztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi9pbnB1dCc7XG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xuaW1wb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL3JlbmRlcmVyJztcbmltcG9ydCB7IFVwZGF0ZXIgfSBmcm9tICcuL3VwZGF0ZXInOyBcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcblx0Y29udGFpbmVyIDogc3RyaW5nO1xuXHRzaG93QUFCQiA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcblx0cHVibGljIGNvbmZpZyA6IENvbmZpZztcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xuXHRwdWJsaWMgY29udGV4dCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblx0cHVibGljIGlzUnVubmluZyA9IGZhbHNlO1xuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XG5cdHB1YmxpYyBidWxsZXRzOiBCdWxsZXRbXSA9IFtdO1xuXHRwdWJsaWMgZW5lbWllczogRW5lbXlbXSA9IFtdO1xuXG5cdHB1YmxpYyBnYW1lVGltZTogRGF0ZTtcblxuXHRwdWJsaWMgbWFwOiBNYXA7XG5cdHB1YmxpYyBpbnB1dDogSW5wdXQ7XG5cdHB1YmxpYyB2aWV3cG9ydDogVmlld3BvcnQ7XG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XG5cdHB1YmxpYyB1cGRhdGVyOiBVcGRhdGVyO1xuXHRwdWJsaWMgY29sbGlzaW9uczogQ29sbGlzaW9uTWFuYWdlcjtcblx0cHVibGljIG1vdXNlOiBQb2ludDtcblx0LyoqXG5cdCAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSB1bmlxdWUgSUQ7IHVzZWQgdG8gY2FuY2VsIFJBRi1sb29wXG5cdCAqIEB0eXBlIHtudW1iZXJ9XG5cdCAqL1xuXHRwcml2YXRlIF9yYWZJZCA6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihjb25maWc6IENvbmZpZykge1xuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xuXHRcdHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5jb250YWluZXIpO1xuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIodGhpcyk7XG5cdFx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XG5cdFx0dGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh0aGlzKTtcblx0XHR0aGlzLnZpZXdwb3J0ID0gbmV3IFZpZXdwb3J0KHRoaXMpO1xuXHRcdHRoaXMudmlld3BvcnQudGFyZ2V0ID0gdGhpcy5wbGF5ZXIuYm9keS5wb3NpdGlvbjtcblxuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIodGhpcyk7XG5cdFx0dGhpcy51cGRhdGVyID0gbmV3IFVwZGF0ZXIodGhpcyk7XG5cdFx0dGhpcy5jb2xsaXNpb25zID0gbmV3IENvbGxpc2lvbk1hbmFnZXIodGhpcyk7XG5cdFx0dGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMucGxheWVyKSk7XG5cdH1cblxuXHR0aWNrKCkgOiB2b2lkIHtcblx0XHR0aGlzLmdhbWVUaW1lID0gbmV3IERhdGUoKTtcblxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xuXHRcdFx0dGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcblx0XHRcdHRoaXMudXBkYXRlci51cGRhdGUoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnRpY2suYmluZCh0aGlzKSk7XG5cdH1cblxuXHRydW4oKSA6IHZvaWQge1xuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcblx0XHRcdHRoaXMudGljaygpO1xuXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0c3RvcCgpIDogdm9pZCB7XG5cdFx0aWYgKHRoaXMuaXNSdW5uaW5nKSB7XG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XG5cblx0XHRcdHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG59XG5cbnZhciBnYW1lID0gbmV3IEdhbWUoe1xuXHRjb250YWluZXI6ICcuZ2FtZScsXG5cdHNob3dBQUJCOiBmYWxzZVxufSk7XG5cbmdhbWUucnVuKCk7IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcblxuZXhwb3J0IGVudW0gQWN0aW9uIHsgXG5cdFVwLCBcblx0RG93bixcblx0TGVmdCxcblx0UmlnaHQsXG5cdEF0dGFja1xufVxuXG5lbnVtIEtleSB7XG5cdFcgPSA4Nyxcblx0QSA9IDY1LFxuXHRTID0gODMsXG5cdEQgPSA2OCxcblx0VXAgPSAzOCxcblx0RG93biA9IDQwLFxuXHRMZWZ0ID0gMzcsXG5cdFJpZ2h0ID0gMzlcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0IHtcblx0cHJpdmF0ZSBfYmluZGluZ3MgOiBNYXA8QWN0aW9uPiA9IHtcblx0XHRbS2V5LlddIDogQWN0aW9uLlVwLFxuXHRcdFtLZXkuQV0gOiBBY3Rpb24uTGVmdCxcblx0XHRbS2V5LlNdIDogQWN0aW9uLkRvd24sXG5cdFx0W0tleS5EXSA6IEFjdGlvbi5SaWdodCxcblx0XHRbS2V5LlVwXSA6IEFjdGlvbi5VcCxcblx0XHRbS2V5LkRvd25dIDogQWN0aW9uLkRvd24sXG5cdFx0W0tleS5MZWZ0XSA6IEFjdGlvbi5MZWZ0LFxuXHRcdFtLZXkuUmlnaHRdIDogQWN0aW9uLlJpZ2h0XG5cdH07XG5cblx0cHVibGljIGFjdGlvbnMgOiBNYXA8Ym9vbGVhbj4gPSB7fTtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cdHByaXZhdGUgX21vdXNlUG9zOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xuXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcykpO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duLmJpbmQodGhpcykpO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwLmJpbmQodGhpcykpO1xuXHR9XG5cblx0YmluZChrZXk6IEtleSwgYWN0aW9uOiBBY3Rpb24pIHtcblx0XHR0aGlzLnVuYmluZChrZXkpO1xuXG5cdFx0dGhpcy5fYmluZGluZ3Nba2V5XSA9IGFjdGlvbjtcblx0fVxuXG5cdHVuYmluZChrZXk6IEtleSkge1xuXHRcdGlmICh0aGlzLl9iaW5kaW5nc1trZXldKSB7XG5cdFx0XHRkZWxldGUgdGhpcy5fYmluZGluZ3Nba2V5XTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7IFxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcblxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSB0cnVlO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBvbktleVVwKGU6IEtleWJvYXJkRXZlbnQpIHtcblx0XHRsZXQgYWN0aW9uID0gdGhpcy5fYmluZGluZ3NbZS53aGljaF07XG5cblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuYWN0aW9uc1thY3Rpb25dID0gZmFsc2U7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VEb3duKGU6IE1vdXNlRXZlbnQpIHtcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcblxuXHRcdHRoaXMuZ2V0TW91c2VQb3NpdGlvbihlKTtcblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gdHJ1ZTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpIHtcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcblxuXHRcdGlmIChlLmJ1dHRvbiA9PSBsZWZ0QnV0dG9uKSB7XG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSBmYWxzZTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE8gOiBOZWVkcyBiZXR0ZXIgaW1wbGVtZW50YXRpb25cblx0cHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGU6IE1vdXNlRXZlbnQpIHsgXG5cdFx0dmFyIGNhbnZhc09mZnNldCA9IHRoaXMuX2dhbWUuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XG5cdCAgICAgIHg6IGUuY2xpZW50WCAtIGNhbnZhc09mZnNldC5sZWZ0LFxuXHQgICAgICB5OiBlLmNsaWVudFkgLSBjYW52YXNPZmZzZXQudG9wXG5cdCAgICB9O1xuXG5cdCAgIFx0dGhpcy5fZ2FtZS5tb3VzZSA9IHtcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIHVwZGF0ZSgpIHtcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xuXHRcdFx0eDogdGhpcy5fbW91c2VQb3MueCArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcblx0XHR9XG5cdH1cbn0iLCJleHBvcnQgY2xhc3MgTWFwIHsgXG5cdHB1YmxpYyB3aWR0aCA6IG51bWJlciA9IDIwMDA7XG5cdHB1YmxpYyBoZWlnaHQgOiBudW1iZXIgPSAxNTAwO1xufSIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuXG5cbmV4cG9ydCBjbGFzcyBQaHlzaWNzIHtcblx0IC8qKlxuICAgICAqIENoZWNrcyBpZiB0d28gcmVjdGFuZ3VsYXIgYm9kaWVzIGludGVyc2VjdFxuICAgICAqIEBwYXJhbSAge1JlY3R9IGJvZHkxIEZpcnN0IGJvZHkgd2l0aCB7eCx5fSBwb3NpdGlvbiBhbmQge3dpZHRoLCBoZWlnaHR9XG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTIgU2Vjb25kIGJvZHlcbiAgICAgKiBAcmV0dXJuIHtib29sfSBUcnVlIGlmIHRoZXkgaW50ZXJzZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhib2R5MTogQm9keSwgYm9keTI6IEJvZHkpIDogYm9vbGVhbiB7XG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25YID0gYm9keTEucG9zaXRpb24ueCA8IGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCBcbiAgICAgICAgXHRcdFx0XHQgJiYgYm9keTEucG9zaXRpb24ueCArIGJvZHkxLndpZHRoID4gYm9keTIucG9zaXRpb24ueDtcbiAgICAgICAgXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25ZID0gYm9keTEucG9zaXRpb24ueSA8IGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQgXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnkgKyBib2R5MS5oZWlnaHQgPiBib2R5Mi5wb3NpdGlvbi55O1xuXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25YICYmIGludGVyc2VjdGlvblk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbGxpZGUoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5LCBjb2xsaXNpb25DYWxsYmFjazogRnVuY3Rpb24pIDogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmludGVyc2VjdHMoYm9keTEsIGJvZHkyKSkge1xuICAgICAgICAgICAgY29sbGlzaW9uQ2FsbGJhY2soKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL2lucHV0JztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFBsYXllciBleHRlbmRzIEVudGl0eSB7XG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcblxuXHRwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keSh7IHg6IDEwLCB5OiAxMCB9LCAzNiwgMzYpO1xuXHRwdWJsaWMgc3BlZWQ6IG51bWJlciA9IDM7XG5cdHB1YmxpYyBhdHRhY2tTcGVlZCA9IDE1MDtcblxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbiA6IEFuaW1hdGlvbjtcblx0cHJpdmF0ZSBfYW5pbWF0aW9ucyA6IE1hcDxBbmltYXRpb24+ID0ge1xuXHQgICAgJ2lkbGUnIDogbmV3IEFuaW1hdGlvbigxLCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXG5cdCAgICAncmlnaHQnIDogbmV3IEFuaW1hdGlvbig0LCAwLCBGcmFtZS5jcmVhdGUoMCwgMCwgMzYsIDM2KSksXG5cdCAgICAnbGVmdCcgOiBuZXcgQW5pbWF0aW9uKDQsIDEsIEZyYW1lLmNyZWF0ZSgwLCAwLCAzNiwgMzYpKVxuXHR9O1xuXHRwcml2YXRlIF9idWxsZXRPZmZzZXQgOiBQb2ludCA9IHsgeDogMTIsIHk6IDE4IH07XG5cblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cbiAgICAgICAgdGhpcy5hbmltYXRlKCdpZGxlJyk7XG5cdH1cblxuXHRzaG9vdCgpIDogdm9pZCB7XG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xuXHRcdFx0dGhpcy5fbGFzdFNob3QgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0bGV0IGJ1bGxldFNwYXduID0gT2JqZWN0LmFzc2lnbih7fSwgVXRpbC5hZGRQb2ludCh0aGlzLmJvZHkucG9zaXRpb24sIHRoaXMuX2J1bGxldE9mZnNldCkpO1xuXG5cdFx0XHRsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRTcGF3biwgdGhpcy5fZ2FtZS5tb3VzZSwgdGhpcyk7XG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMucHVzaChidWxsZXQpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY2FuU2hvb3QoKSA6IGJvb2xlYW4ge1xuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XG5cblx0XHRyZXR1cm4gZGlmZiA+IHRoaXMuYXR0YWNrU3BlZWQ7XG5cdH1cblxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24uc3BlZWQgPSAxMDtcblx0fVxuXG5cdHVwYXRlTW92ZW1lbnQoKSA6IHZvaWQge1xuXHRcdGxldCBpbnB1dCA9IHRoaXMuX2dhbWUuaW5wdXQ7XG5cblx0XHRpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0pIHtcblx0XHRcdHRoaXMuYm9keS5wb3NpdGlvbi54IC09IHRoaXMuc3BlZWQ7XG5cdFx0XHR0aGlzLmFuaW1hdGUoJ2xlZnQnKTtcblxuXHRcdH0gZWxzZSBpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uUmlnaHRdKSB7XG5cdFx0XHR0aGlzLmJvZHkucG9zaXRpb24ueCArPSB0aGlzLnNwZWVkO1xuXHRcdFx0dGhpcy5hbmltYXRlKCdyaWdodCcpO1xuXHRcdH1cblxuICAgIGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0pIHtcblxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnkgLT0gdGhpcy5zcGVlZDtcblxuXHRcdH0gZWxzZSBpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uRG93bl0pIHtcblxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnkgKz0gdGhpcy5zcGVlZDtcblx0XHR9XG5cblx0XHRpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSkge1xuXHQgICAgICAgIHRoaXMuc2hvb3QoKTtcblx0XHR9XG5cdH1cblxuXHR1cGRhdGUoKSA6IHZvaWQge1xuXHRcdHRoaXMudXBhdGVNb3ZlbWVudCgpO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBHYW1lLCBDb25maWcgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XG5cblx0cHJpdmF0ZSBfdGlsZSA9IHtcblx0XHR3aWR0aCA6IDMwLFxuXHRcdGhlaWdodDogMzBcblx0fVxuXG5cblx0LyoqXG5cdCAqXHRTcHJpdGVzIEkgdXNlIGZvciBhIGRldmVsb3BtZW50IHdlcmUgY3JlYXRlZCBieSBDb2R5IFNoZXBwIGZvciBoaXMgZ2FtZSBEZW50YWwgRGVmZW5kZXI6IFNhZ2Egb2YgdGhlIENhbmR5IEhvcmRlLlxuXHQgKlx0UGxlYXNlIGNoZWNrIGhpcyBnaXRodWIgcmVwbzogaHR0cHM6Ly9naXRodWIuY29tL2NzaGVwcC9jYW5keWphbS9cblx0ICovXG5cdHByaXZhdGUgX3Jlc291cmNlcyA9IHtcblx0XHQncGxheWVyJyA6ICcuL2ltZy9wbGF5ZXIucG5nJyxcblx0XHQnZW5lbXknIDogJy4vaW1nL2VuZW15LnBuZycsXG5cdFx0J2J1bGxldCcgOiAnLi9pbWcvYnVsbGV0LnBuZydcblx0fVxuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRpbGUocG9zOiBQb2ludCwgY29sb3I6IHN0cmluZykgOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQucmVjdChwb3MueCwgcG9zLnksIHRoaXMuX3RpbGUud2lkdGgsIHRoaXMuX3RpbGUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyVGlsZXMoKSA6IHZvaWQge1xuICAgICAgICB2YXIgY29sb3JzID0gW1wiIzc4NWM5OFwiLCBcIiM2OTRmODhcIl07XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLl9nYW1lLm1hcC53aWR0aDsgeCArPSB0aGlzLl90aWxlLndpZHRoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuX2dhbWUubWFwLmhlaWdodDsgeSArPSB0aGlzLl90aWxlLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIHZhciB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcbiAgICAgICAgICAgICAgICB2YXIgeUluZGV4ID0gKHkgLyB0aGlzLl90aWxlLmhlaWdodCkgJSAyO1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVQb3MgPSB0aGlzLmNhbWVyYU9mZnNldCh7eCwgeX0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaWxlKHRpbGVQb3MsIGNvbG9yc1t4SW5kZXggXiB5SW5kZXhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2FtZXJhT2Zmc2V0KHBvczogUG9pbnQpIDogUG9pbnQge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHBvcy54IC0gc2VsZi5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcbiAgICAgICAgfTtcbiAgICB9XG5cblx0cHJpdmF0ZSByZW5kZXJIZWxwZXIoc291cmNlIDogc3RyaW5nLCBjb2xsZWN0aW9uIDogRW50aXR5W10pIHtcblx0XHRsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cdFx0aW1nLnNyYyA9IHNvdXJjZTtcblxuXHRcdGNvbGxlY3Rpb24uZm9yRWFjaCgoZSkgPT4ge1xuXHRcdFx0dmFyIGZyYW1lID0gZS5jdXJyZW50QW5pbWF0aW9uLmN1cnJlbnRGcmFtZTtcblx0XHRcdHZhciBwb3MgPSB0aGlzLmNhbWVyYU9mZnNldChlLmJvZHkucG9zaXRpb24pO1xuXG5cdFx0XHRpZiAodGhpcy5fZ2FtZS5jb25maWcuc2hvd0FBQkIpIHtcblx0XHRcdFx0dGhpcy5yZW5kZXJBQUJCKG5ldyBCb2R5KHBvcywgZS5ib2R5LndpZHRoLCBlLmJvZHkuaGVpZ2h0KSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2dhbWUuY29udGV4dC5kcmF3SW1hZ2UoXG5cdFx0XHRcdGltZyxcblx0XHRcdFx0ZnJhbWUueCwgZnJhbWUueSxcblx0XHRcdFx0ZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCxcblx0XHRcdFx0cG9zLngsIHBvcy55LFxuXHRcdFx0XHRmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0XG5cdFx0XHQpO1xuXG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckFBQkIoYm9keTogQm9keSkge1xuXHRcdHZhciBjdHggPSB0aGlzLl9nYW1lLmNvbnRleHQ7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgwLjUsIDAuNSk7XG5cdFx0Y3R4LnJlY3QoXG5cdFx0XHRib2R5LnBvc2l0aW9uLngsXG5cdFx0XHRib2R5LnBvc2l0aW9uLnksXG5cdFx0XHRib2R5LndpZHRoLFxuXHRcdFx0Ym9keS5oZWlnaHRcblx0XHQpO1xuXG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcblx0XHRjdHgubGluZVdpZHRoID0gMTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtMC41LCAtMC41KTtcblx0fVxuXG5cdHJlbmRlcigpIDogdm9pZCB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0dGhpcy5yZW5kZXJUaWxlcygpO1xuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snYnVsbGV0J10sIHRoaXMuX2dhbWUuYnVsbGV0cyk7XG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydlbmVteSddLCB0aGlzLl9nYW1lLmVuZW1pZXMpO1xuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1sncGxheWVyJ10sIFt0aGlzLl9nYW1lLnBsYXllcl0pO1xuXHR9XG5cblx0Y2xlYXIoKSA6IHZvaWQge1xuXHRcdGxldCB3ID0gdGhpcy5fZ2FtZS5jYW52YXMud2lkdGg7XG5cdFx0bGV0IGggPSB0aGlzLl9nYW1lLmNhbnZhcy5oZWlnaHQ7XG5cblx0XHR0aGlzLl9nYW1lLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZXIge1xuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcblxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcblx0fVxuXG5cdHByaXZhdGUgYWxsRW50aXRpZXMoKSA6IEVudGl0eVtdIHtcblx0XHRyZXR1cm4gPEVudGl0eVtdPiBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLFxuXHRcdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLFxuXHRcdFx0dGhpcy5fZ2FtZS5wbGF5ZXJcblx0XHQpO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVBbmltYXRpb25zKCkgOiB2b2lkIHtcblx0XHR2YXIgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XG5cblx0XHRlbnRpdGllcy5mb3JFYWNoKChlKT0+IHsgZS5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZSh0aGlzLl9nYW1lLmdhbWVUaW1lKTsgfSk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUVudGl0aWVzKCkgOiB2b2lkIHtcblx0XHR2YXIgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XG5cblx0XHRlbnRpdGllcy5mb3JFYWNoKGUgPT4geyBlLnVwZGF0ZSgpOyB9KTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRGVhZCgpIDogdm9pZCB7XG5cdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmJ1bGxldHMpOyB9KVxuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKGUgPT4geyB0aGlzLnJlbW92ZURlYWQoZSwgdGhpcy5fZ2FtZS5lbmVtaWVzKTsgfSlcblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlRGVhZChlOiBFbnRpdHksIGNvbGxlY3Rpb246IEVudGl0eVtdKSB7XG5cdFx0aWYgKGUuYWxpdmUgPT09IGZhbHNlKSB7XG5cdFx0XHR2YXIgZUluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGUpO1xuXG5cdFx0XHRpZiAoZUluZGV4ID4gLTEpIHtcblx0XHRcdFx0Y29sbGVjdGlvbi5zcGxpY2UoZUluZGV4LCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR1cGRhdGUoKSA6IHZvaWQge1xuXHRcdHRoaXMudXBkYXRlQW5pbWF0aW9ucygpO1xuXHRcdHRoaXMudXBkYXRlRW50aXRpZXMoKTtcblx0XHR0aGlzLnVwZGF0ZURlYWQoKTtcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnVwZGF0ZSgpO1xuXHRcdHRoaXMuX2dhbWUuY29sbGlzaW9ucy51cGRhdGUoKTtcblx0XHR0aGlzLl9nYW1lLmlucHV0LnVwZGF0ZSgpO1xuXHR9XG59IiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcblxuZXhwb3J0IGNsYXNzIFV0aWwge1xuXHRzdGF0aWMgY2xhbXAodmFsdWUgOiBudW1iZXIsIG1pbiA6IG51bWJlciwgbWF4IDogbnVtYmVyKSA6IG51bWJlciB7XG5cdFx0aWYgKHZhbHVlID4gbWF4KSB7IHJldHVybiBtYXg7IH1cblx0XHRpZiAodmFsdWUgPCBtaW4pIHsgcmV0dXJuIG1pbjsgfVxuXG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0c3RhdGljIGFkZFBvaW50KHBvaW50MTogUG9pbnQsIHBvaW50MjogUG9pbnQpIDogUG9pbnQge1xuXHRcdHJldHVybiB7XG5cdFx0XHR4IDogcG9pbnQxLnggKyBwb2ludDIueCxcblx0XHRcdHkgOiBwb2ludDEueSArIHBvaW50Mi55XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0cHVibGljIHRhcmdldDogUG9pbnQ7XG5cdHB1YmxpYyBwb3NpdGlvbjogUG9pbnQgPSB7IHggOiAwLCB5IDogMCB9O1xuXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XG5cdHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XG5cdHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xuXHRcdHRoaXMuX2hlaWdodCA9IGdhbWVJbnN0YW5jZS5jYW52YXMuaGVpZ2h0O1xuXHR9XG5cblx0cHJpdmF0ZSBjYWxjdWxhdGVQb3NpdGlvbigpIDogdm9pZCB7XG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC54IC0gdGhpcy5fd2lkdGggLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC53aWR0aCAtIHRoaXMuX3dpZHRoKTtcblx0XHR0aGlzLnBvc2l0aW9uLnkgPSBVdGlsLmNsYW1wKHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHQpO1xuXHR9XG5cblx0dXBkYXRlKCkgOiB2b2lkIHtcblx0XHR0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XG5cdH1cbn0iXX0=
