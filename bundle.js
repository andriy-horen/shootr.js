(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
class Animation {
    constructor(frame) {
        this.speed = 0;
        this._lastAnimated = new Date(0);
        this.currentFrame = frame;
    }
    canAnimate(time) {
        var diff = time.getTime() - this._lastAnimated.getTime();
        return diff > this.speed;
    }
    update(gameTime) {
        if (this.canAnimate(gameTime)) {
            this._lastAnimated = gameTime;
            this.currentFrame.next();
        }
    }
    reset() {
        this._lastAnimated = new Date(0);
        this.currentFrame.reset();
    }
}
exports.Animation = Animation;
},{}],2:[function(require,module,exports){
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
const sprite_1 = require('./sprite');
class Bullet extends entity_1.Entity {
    constructor(position, target, parent) {
        super();
        this.speed = 10;
        this.damageAmount = 10;
        this.body = new body_1.Body({ x: 0, y: 0 }, 3, 3);
        this.currentAnimation = new animation_1.Animation(new frame_1.Frame(1, 0, new sprite_1.Sprite({ x: 0, y: 0 }, 10, 10)));
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
},{"./animation":1,"./body":2,"./entity":6,"./frame":7,"./sprite":14}],4:[function(require,module,exports){
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
},{"./physics":11}],5:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const body_1 = require('./body');
const sprite_1 = require('./sprite');
const frame_1 = require('./frame');
const animation_1 = require('./animation');
class Enemy extends entity_1.Entity {
    constructor(target) {
        super();
        this._animations = {
            'idle': new animation_1.Animation(new frame_1.Frame(1, 0, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36))),
            'right': new animation_1.Animation(new frame_1.Frame(4, 0, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36))),
            'left': new animation_1.Animation(new frame_1.Frame(4, 1, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36)))
        };
        this.speed = 3;
        this.body = new body_1.Body({ x: 100, y: 100 }, 36, 36);
        this.target = target;
        this.animate('right');
    }
    animate(animation) {
        this.currentAnimation = this._animations[animation];
        this.currentAnimation.speed = 100;
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
},{"./animation":1,"./body":2,"./entity":6,"./frame":7,"./sprite":14}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
"use strict";
class Frame {
    constructor(length, row, sprite) {
        this.index = 0;
        this._length = length;
        this.sprite = sprite;
        this.sprite.offset.y = this.sprite.height * row;
    }
    next() {
        this.index = (this.index + 1) % this._length;
        this.sprite.offset.x = this.sprite.width * this.index;
    }
    reset() {
        this.index = 0;
        this.sprite.offset = { x: 0, y: 0 };
    }
}
exports.Frame = Frame;
},{}],8:[function(require,module,exports){
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
},{"./collision-manager":4,"./enemy":5,"./input":9,"./map":10,"./player":12,"./renderer":13,"./updater":15,"./viewport":17}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
"use strict";
class Map {
    constructor() {
        this.width = 2000;
        this.height = 1500;
    }
}
exports.Map = Map;
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
"use strict";
const entity_1 = require('./entity');
const input_1 = require('./input');
const body_1 = require('./body');
const bullet_1 = require('./bullet');
const frame_1 = require('./frame');
const sprite_1 = require('./sprite');
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
            'idle': new animation_1.Animation(new frame_1.Frame(1, 0, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36))),
            'right': new animation_1.Animation(new frame_1.Frame(4, 0, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36))),
            'left': new animation_1.Animation(new frame_1.Frame(4, 1, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36)))
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
        this.currentAnimation.speed = 100;
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
},{"./animation":1,"./body":2,"./bullet":3,"./entity":6,"./frame":7,"./input":9,"./sprite":14,"./util":16}],13:[function(require,module,exports){
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
            var sprite = e.currentAnimation.currentFrame.sprite;
            var pos = this.cameraOffset(e.body.position);
            if (this._game.config.showAABB) {
                this.renderAABB(new body_1.Body(pos, e.body.width, e.body.height));
            }
            this._game.context.drawImage(img, sprite.offset.x, sprite.offset.y, sprite.width, sprite.height, pos.x, pos.y, sprite.width, sprite.height);
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
},{"./body":2}],14:[function(require,module,exports){
"use strict";
class Sprite {
    constructor(offset, width, height) {
        this.offset = { x: 0, y: 0 };
        this.width = 0;
        this.height = 0;
        this.offset = offset;
        this.width = width;
        this.height = height;
    }
}
exports.Sprite = Sprite;
},{}],15:[function(require,module,exports){
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
},{"./util":16}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9yZW5kZXJlci50cyIsInNyYy9qcy9zcHJpdGUudHMiLCJzcmMvanMvdXBkYXRlci50cyIsInNyYy9qcy91dGlsLnRzIiwic3JjL2pzL3ZpZXdwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0VBO0lBTUMsWUFBWSxLQUFhO1FBSmxCLFVBQUssR0FBWSxDQUFDLENBQUM7UUFFbEIsa0JBQWEsR0FBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUcxQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVc7UUFDckIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFekQsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBYztRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztZQUU5QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7SUFDRixDQUFDO0lBRUQsS0FBSztRQUNKLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0FBQ0YsQ0FBQztBQTVCWSxpQkFBUyxZQTRCckIsQ0FBQTs7O0FDNUJEO0lBT0MsWUFBWSxRQUFlLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFMMUQsYUFBUSxHQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFNaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNwQyxDQUFDO0FBQ0YsQ0FBQztBQWpCWSxZQUFJLE9BaUJoQixDQUFBOzs7QUNuQkQseUJBQXVCLFVBQVUsQ0FBQyxDQUFBO0FBQ2xDLHVCQUFxQixRQUFRLENBQUMsQ0FBQTtBQUU5Qiw0QkFBMEIsYUFBYSxDQUFDLENBQUE7QUFDeEMsd0JBQXNCLFNBQVMsQ0FBQyxDQUFBO0FBQ2hDLHlCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUVsQyxxQkFBNEIsZUFBTTtJQVFqQyxZQUFZLFFBQWUsRUFBRSxNQUFhLEVBQUUsTUFBZTtRQUMxRCxPQUFPLENBQUM7UUFORixVQUFLLEdBQVksRUFBRSxDQUFDO1FBQ3BCLGlCQUFZLEdBQVksRUFBRSxDQUFDO1FBQzNCLFNBQUksR0FBVSxJQUFJLFdBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1QyxxQkFBZ0IsR0FBYyxJQUFJLHFCQUFTLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLGVBQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFLdkcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZTtRQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMs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QUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDbkMsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFlO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDaEQsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUVoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFHN0IsRUFBRSxDQUFDLENB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QXRCWSxnQkFBUSxXQXNCcEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XHJcblx0cHVibGljIGN1cnJlbnRGcmFtZSA6IEZyYW1lO1xyXG5cdHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDA7XHJcblxyXG5cdHByaXZhdGUgX2xhc3RBbmltYXRlZCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0Y29uc3RydWN0b3IoZnJhbWUgOiBGcmFtZSkge1xyXG5cdFx0dGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcclxuXHR9XHJcblxyXG5cdGNhbkFuaW1hdGUodGltZSA6IERhdGUpIDogYm9vbGVhbiB7XHJcblx0XHR2YXIgZGlmZiA9IHRpbWUuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdEFuaW1hdGVkLmdldFRpbWUoKTtcclxuXHJcblx0XHRyZXR1cm4gZGlmZiA+IHRoaXMuc3BlZWQ7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoZ2FtZVRpbWU6IERhdGUpIHtcclxuXHRcdGlmICh0aGlzLmNhbkFuaW1hdGUoZ2FtZVRpbWUpKSB7XHJcblx0XHRcdHRoaXMuX2xhc3RBbmltYXRlZCA9IGdhbWVUaW1lO1xyXG5cclxuXHRcdFx0dGhpcy5jdXJyZW50RnJhbWUubmV4dCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmVzZXQoKSB7XHJcblx0XHR0aGlzLl9sYXN0QW5pbWF0ZWQgPSBuZXcgRGF0ZSgwKTtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lLnJlc2V0KCk7XHJcblx0fVxyXG59ICIsImltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9keSB7XHJcblx0cG9zaXRpb24gOiBQb2ludDtcclxuXHR2ZWxvY2l0eTogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0d2lkdGggOiBudW1iZXI7XHJcblx0aGVpZ2h0IDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9pbnQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdHRoaXMucG9zaXRpb24ueCArPSB0aGlzLnZlbG9jaXR5Lng7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnkgKz0gdGhpcy52ZWxvY2l0eS55O1xyXG5cdH1cclxufSIsImltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1bGxldCBleHRlbmRzIEVudGl0eSB7XHJcblx0cHVibGljIHRhcmdldCA6IFBvaW50O1xyXG5cdHB1YmxpYyBwYXJlbnQgOiBFbnRpdHk7XHJcblx0cHVibGljIHNwZWVkIDogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIGRhbWFnZUFtb3VudCA6IG51bWJlciA9IDEwO1xyXG5cdHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KHsgeDogMCwgeTogMH0sIDMsIDMpO1x0XHJcblx0cHVibGljIGN1cnJlbnRBbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24obmV3IEZyYW1lKDEsIDAsIG5ldyBTcHJpdGUoeyB4OiAwLCB5OiAwIH0sIDEwLCAxMCkpKTtcclxuXHJcblx0Y29uc3RydWN0b3IocG9zaXRpb246IFBvaW50LCB0YXJnZXQ6IFBvaW50LCBwYXJlbnQgOiBFbnRpdHkpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5ib2R5LnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG5cclxuXHRcdHRoaXMuc2V0VmVsb2NpdHkodGhpcy50YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRWZWxvY2l0eShwb3NpdGlvbjogUG9pbnQpIDogdm9pZCB7XHJcbiAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMocG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54KTtcclxuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkaXJYID0gcG9zaXRpb24ueCAtIHRoaXMuYm9keS5wb3NpdGlvbi54ID4gMCA/IDEgOiAtMTtcclxuICAgICAgICB2YXIgZGlyWSA9IHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHggPSBkeCAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclg7XHJcbiAgICAgICAgdmFyIHkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eSA9IHsgeCwgeSB9O1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuYm9keS51cGRhdGUoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgUGh5c2ljcyB9IGZyb20gJy4vcGh5c2ljcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uTWFuYWdlciB7IFxyXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2UgOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xyXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMuZm9yRWFjaCgoYnVsbGV0KSA9PiB7XHJcblx0XHRcdFx0UGh5c2ljcy5jb2xsaWRlKGVuZW15LmJvZHksIGJ1bGxldC5ib2R5LCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRlbmVteS5kYW1hZ2UoYnVsbGV0LmRhbWFnZUFtb3VudCwgYnVsbGV0LnBhcmVudCk7XHJcblxyXG5cdFx0XHRcdFx0YnVsbGV0LmtpbGwoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5pbXBvcnQgeyBHZW5lcmljTWFwIGFzIE1hcCB9IGZyb20gJy4vY29sbGVjdGlvbnMnO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuXG5pbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuL3Nwcml0ZSc7XG5pbXBvcnQgeyBGcmFtZSB9IGZyb20gJy4vZnJhbWUnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBFbnRpdHkge1xuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XG5cdCAgICAnaWRsZScgOiBuZXcgQW5pbWF0aW9uKG5ldyBGcmFtZSgxLCAwLCBuZXcgU3ByaXRlKHsgeDogMCwgeTogMCB9LCAzNiwgMzYgKSkpLFxuXHQgICAgJ3JpZ2h0JyA6IG5ldyBBbmltYXRpb24obmV3IEZyYW1lKDQsIDAsIG5ldyBTcHJpdGUoeyB4OiAwLCB5OiAwIH0sIDM2LCAzNiApKSksIFxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbihuZXcgRnJhbWUoNCwgMSwgbmV3IFNwcml0ZSh7IHg6IDAsIHk6IDAgfSwgMzYsIDM2ICkpKSBcbiAgICB9O1xuXG4gICAgcHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XG4gICAgcHVibGljIHNwZWVkIDogbnVtYmVyID0gMztcbiAgICBwdWJsaWMgdGFyZ2V0IDogRW50aXR5O1xuICAgIHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KHsgeDogMTAwLCB5OiAxMDAgfSwgMzYsIDM2KTtcblxuXHRjb25zdHJ1Y3Rvcih0YXJnZXQ6IEVudGl0eSkge1xuXHRcdHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XG5cdH1cblxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZykgOiB2b2lkIHtcblx0XHR0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25zW2FuaW1hdGlvbl07XG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTAwO1xuXHR9XG5cblx0bW92ZVRvd2FyZHMocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyhwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLngpO1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyhwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRpclggPSBwb3NpdGlvbi54IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnggPiAwID8gMSA6IC0xO1xuICAgICAgICB2YXIgZGlyWSA9IHBvc2l0aW9uLnkgLSB0aGlzLmJvZHkucG9zaXRpb24ueSA+IDAgPyAxIDogLTE7XG4gICAgICAgIFxuICAgICAgICB2YXIgdmVsWCA9IGR4ICogKHRoaXMuc3BlZWQgLyAoZHggKyBkeSkpICogZGlyWDtcbiAgICAgICAgdmFyIHZlbFkgPSBkeSAqICh0aGlzLnNwZWVkIC8gKGR4ICsgZHkpKSAqIGRpclk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkucG9zaXRpb24ueCArPSB2ZWxYO1xuICAgICAgICB0aGlzLmJvZHkucG9zaXRpb24ueSArPSB2ZWxZO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIChkaXJYID4gMCkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdsZWZ0Jyk7XG4gICAgICAgIH1cblx0fVxuXG5cdHVwZGF0ZSgpIDogdm9pZCB7XG5cdFx0dGhpcy5tb3ZlVG93YXJkcyh0aGlzLnRhcmdldC5ib2R5LnBvc2l0aW9uKTtcblx0fVxufSIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5IHtcblx0cHJpdmF0ZSBfaGVhbHRoIDogbnVtYmVyID0gMTAwO1xuXHRwcml2YXRlIF9hbGl2ZSA6IGJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9hdHRhY2tlciA6IEVudGl0eTtcblxuXHRwdWJsaWMgYm9keSA6IEJvZHk7XG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xuXG5cdGdldCBoZWFsdGgoKSA6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2hlYWx0aDtcblx0fVxuXG5cdGdldCBhbGl2ZSgpIDogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2FsaXZlO1xuXHR9XG5cblx0cHJpdmF0ZSBfc2V0SGVhbHRoKG51bWJlcjogbnVtYmVyKSB7XG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA+IDAgJiYgdGhpcy5fYWxpdmUpIHtcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XG5cdFx0XHR0aGlzLmtpbGwoKTtcblx0XHR9XG5cdH1cblxuXHRraWxsKCkge1xuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XG5cdFx0dGhpcy5fYWxpdmUgPSBmYWxzZTtcblx0fVxuXG5cdGRhbWFnZShhbW91bnQgOiBudW1iZXIsIGF0dGFja2VyOiBFbnRpdHkpIDogdm9pZCB7XG5cdFx0dGhpcy5fc2V0SGVhbHRoKC1hbW91bnQpO1xuXG5cdFx0dGhpcy5fYXR0YWNrZXIgPSBhdHRhY2tlcjtcblx0fVxuXG5cdGhlYWwoYW1vdW50IDogbnVtYmVyKSB7XG5cdFx0dGhpcy5fc2V0SGVhbHRoKGFtb3VudCk7XG5cdH1cblxuXHR1cGRhdGUoKSB7fVxufSIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZSB7XHJcblx0cHVibGljIGluZGV4IDogbnVtYmVyID0gMDtcclxuXHRwdWJsaWMgc3ByaXRlIDogU3ByaXRlO1xyXG5cclxuXHRwcml2YXRlIF9sZW5ndGggOiBudW1iZXI7XHJcblx0cHJpdmF0ZSBfcm93IDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihsZW5ndGggOiBudW1iZXIsIHJvdyA6IG51bWJlciwgc3ByaXRlIDogU3ByaXRlKSB7XHJcblx0XHR0aGlzLl9sZW5ndGggPSBsZW5ndGg7XHJcblx0XHR0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuXHJcblx0XHR0aGlzLnNwcml0ZS5vZmZzZXQueSA9IHRoaXMuc3ByaXRlLmhlaWdodCAqIHJvdztcclxuXHR9XHJcblxyXG5cdG5leHQoKSB7XHJcblx0XHR0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXggKyAxKSAlIHRoaXMuX2xlbmd0aDtcclxuXHJcblx0XHR0aGlzLnNwcml0ZS5vZmZzZXQueCA9IHRoaXMuc3ByaXRlLndpZHRoICogdGhpcy5pbmRleDtcclxuXHR9XHJcblxyXG5cdHJlc2V0KCkge1xyXG5cdFx0dGhpcy5pbmRleCA9IDA7XHJcblx0XHR0aGlzLnNwcml0ZS5vZmZzZXQgPSB7IHggOiAwLCB5IDogMH07XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBDb2xsaXNpb25NYW5hZ2VyIH0gZnJvbSAnLi9jb2xsaXNpb24tbWFuYWdlcic7XHJcbmltcG9ydCB7IEVuZW15IH0gZnJvbSAnLi9lbmVteSc7XHJcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcclxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSAnLi9wbGF5ZXInO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyZXInO1xyXG5pbXBvcnQgeyBVcGRhdGVyIH0gZnJvbSAnLi91cGRhdGVyJzsgXHJcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XHJcblx0Y29udGFpbmVyIDogc3RyaW5nO1xyXG5cdHNob3dBQUJCIDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG5cdHB1YmxpYyBjb25maWcgOiBDb25maWc7XHJcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cdHB1YmxpYyBpc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XHJcblx0cHVibGljIGJ1bGxldHM6IEJ1bGxldFtdID0gW107XHJcblx0cHVibGljIGVuZW1pZXM6IEVuZW15W10gPSBbXTtcclxuXHJcblx0cHVibGljIGdhbWVUaW1lOiBEYXRlO1xyXG5cclxuXHRwdWJsaWMgbWFwOiBNYXA7XHJcblx0cHVibGljIGlucHV0OiBJbnB1dDtcclxuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xyXG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XHJcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XHJcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XHJcblx0cHVibGljIG1vdXNlOiBQb2ludDtcclxuXHQvKipcclxuXHQgKiBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdW5pcXVlIElEOyB1c2VkIHRvIGNhbmNlbCBSQUYtbG9vcFxyXG5cdCAqIEB0eXBlIHtudW1iZXJ9XHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcmFmSWQgOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XHJcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHRcdHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5jb250YWluZXIpO1xyXG5cdFx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcblx0XHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIodGhpcyk7XHJcblx0XHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxuXHRcdHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQodGhpcyk7XHJcblx0XHR0aGlzLnZpZXdwb3J0ID0gbmV3IFZpZXdwb3J0KHRoaXMpO1xyXG5cdFx0dGhpcy52aWV3cG9ydC50YXJnZXQgPSB0aGlzLnBsYXllci5ib2R5LnBvc2l0aW9uO1xyXG5cclxuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIodGhpcyk7XHJcblx0XHR0aGlzLnVwZGF0ZXIgPSBuZXcgVXBkYXRlcih0aGlzKTtcclxuXHRcdHRoaXMuY29sbGlzaW9ucyA9IG5ldyBDb2xsaXNpb25NYW5hZ2VyKHRoaXMpO1xyXG5cdFx0dGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMucGxheWVyKSk7XHJcblx0fVxyXG5cclxuXHR0aWNrKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0cnVuKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcclxuXHRcdFx0dGhpcy50aWNrKCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdG9wKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxudmFyIGdhbWUgPSBuZXcgR2FtZSh7XHJcblx0Y29udGFpbmVyOiAnLmdhbWUnLFxyXG5cdHNob3dBQUJCOiBmYWxzZVxyXG59KTtcclxuXHJcbmdhbWUucnVuKCk7IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XHJcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XHJcblxyXG5leHBvcnQgZW51bSBBY3Rpb24geyBcclxuXHRVcCwgXHJcblx0RG93bixcclxuXHRMZWZ0LFxyXG5cdFJpZ2h0LFxyXG5cdEF0dGFja1xyXG59XHJcblxyXG5lbnVtIEtleSB7XHJcblx0VyA9IDg3LFxyXG5cdEEgPSA2NSxcclxuXHRTID0gODMsXHJcblx0RCA9IDY4LFxyXG5cdFVwID0gMzgsXHJcblx0RG93biA9IDQwLFxyXG5cdExlZnQgPSAzNyxcclxuXHRSaWdodCA9IDM5XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbnB1dCB7XHJcblx0cHJpdmF0ZSBfYmluZGluZ3MgOiBNYXA8QWN0aW9uPiA9IHtcclxuXHRcdFtLZXkuV10gOiBBY3Rpb24uVXAsXHJcblx0XHRbS2V5LkFdIDogQWN0aW9uLkxlZnQsXHJcblx0XHRbS2V5LlNdIDogQWN0aW9uLkRvd24sXHJcblx0XHRbS2V5LkRdIDogQWN0aW9uLlJpZ2h0LFxyXG5cdFx0W0tleS5VcF0gOiBBY3Rpb24uVXAsXHJcblx0XHRbS2V5LkRvd25dIDogQWN0aW9uLkRvd24sXHJcblx0XHRbS2V5LkxlZnRdIDogQWN0aW9uLkxlZnQsXHJcblx0XHRbS2V5LlJpZ2h0XSA6IEFjdGlvbi5SaWdodFxyXG5cdH07XHJcblxyXG5cdHB1YmxpYyBhY3Rpb25zIDogTWFwPGJvb2xlYW4+ID0ge307XHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblx0cHJpdmF0ZSBfbW91c2VQb3M6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcC5iaW5kKHRoaXMpKTtcclxuXHRcdHRoaXMuX2dhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuZ2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24uYmluZCh0aGlzKSk7XHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcC5iaW5kKHRoaXMpKTtcclxuXHR9XHJcblxyXG5cdGJpbmQoa2V5OiBLZXksIGFjdGlvbjogQWN0aW9uKSB7XHJcblx0XHR0aGlzLnVuYmluZChrZXkpO1xyXG5cclxuXHRcdHRoaXMuX2JpbmRpbmdzW2tleV0gPSBhY3Rpb247XHJcblx0fVxyXG5cclxuXHR1bmJpbmQoa2V5OiBLZXkpIHtcclxuXHRcdGlmICh0aGlzLl9iaW5kaW5nc1trZXldKSB7XHJcblx0XHRcdGRlbGV0ZSB0aGlzLl9iaW5kaW5nc1trZXldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbktleURvd24oZTogS2V5Ym9hcmRFdmVudCkgeyBcclxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcclxuXHJcblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbktleVVwKGU6IEtleWJvYXJkRXZlbnQpIHtcclxuXHRcdGxldCBhY3Rpb24gPSB0aGlzLl9iaW5kaW5nc1tlLndoaWNoXTtcclxuXHJcblx0XHRpZiAoYWN0aW9uICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbl0gPSBmYWxzZTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0dGhpcy5nZXRNb3VzZVBvc2l0aW9uKGUpO1xyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gdHJ1ZTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpIHtcclxuXHRcdGNvbnN0IGxlZnRCdXR0b24gPSAwO1xyXG5cclxuXHRcdGlmIChlLmJ1dHRvbiA9PSBsZWZ0QnV0dG9uKSB7XHJcblx0XHRcdHRoaXMuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVE9ETyA6IE5lZWRzIGJldHRlciBpbXBsZW1lbnRhdGlvblxyXG5cdHByaXZhdGUgZ2V0TW91c2VQb3NpdGlvbihlOiBNb3VzZUV2ZW50KSB7IFxyXG5cdFx0dmFyIGNhbnZhc09mZnNldCA9IHRoaXMuX2dhbWUuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHRcdHRoaXMuX21vdXNlUG9zID0ge1xyXG5cdCAgICAgIHg6IGUuY2xpZW50WCAtIGNhbnZhc09mZnNldC5sZWZ0LFxyXG5cdCAgICAgIHk6IGUuY2xpZW50WSAtIGNhbnZhc09mZnNldC50b3BcclxuXHQgICAgfTtcclxuXHJcblx0ICAgXHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0dGhpcy5fZ2FtZS5tb3VzZSA9IHtcclxuXHRcdFx0eDogdGhpcy5fbW91c2VQb3MueCArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuXHRcdFx0eTogdGhpcy5fbW91c2VQb3MueSArIHRoaXMuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueVxyXG5cdFx0fVxyXG5cdH1cclxufSIsImV4cG9ydCBjbGFzcyBNYXAgeyBcclxuXHRwdWJsaWMgd2lkdGggOiBudW1iZXIgPSAyMDAwO1xyXG5cdHB1YmxpYyBoZWlnaHQgOiBudW1iZXIgPSAxNTAwO1xyXG59IiwiaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFBoeXNpY3Mge1xyXG5cdCAvKipcclxuICAgICAqIENoZWNrcyBpZiB0d28gcmVjdGFuZ3VsYXIgYm9kaWVzIGludGVyc2VjdFxyXG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTEgRmlyc3QgYm9keSB3aXRoIHt4LHl9IHBvc2l0aW9uIGFuZCB7d2lkdGgsIGhlaWdodH1cclxuICAgICAqIEBwYXJhbSAge1JlY3R9IGJvZHkyIFNlY29uZCBib2R5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sfSBUcnVlIGlmIHRoZXkgaW50ZXJzZWN0LCBvdGhlcndpc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGludGVyc2VjdHMoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5KSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25YID0gYm9keTEucG9zaXRpb24ueCA8IGJvZHkyLnBvc2l0aW9uLnggKyBib2R5Mi53aWR0aCBcclxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi54ICsgYm9keTEud2lkdGggPiBib2R5Mi5wb3NpdGlvbi54O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25ZID0gYm9keTEucG9zaXRpb24ueSA8IGJvZHkyLnBvc2l0aW9uLnkgKyBib2R5Mi5oZWlnaHQgXHJcbiAgICAgICAgXHRcdFx0XHQgJiYgYm9keTEucG9zaXRpb24ueSArIGJvZHkxLmhlaWdodCA+IGJvZHkyLnBvc2l0aW9uLnk7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25YICYmIGludGVyc2VjdGlvblk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvbGxpZGUoYm9keTE6IEJvZHksIGJvZHkyOiBCb2R5LCBjb2xsaXNpb25DYWxsYmFjazogRnVuY3Rpb24pIDogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhib2R5MSwgYm9keTIpKSB7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkNhbGxiYWNrKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcclxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBCdWxsZXQgfSBmcm9tICcuL2J1bGxldCc7XHJcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5pbXBvcnQgeyBHZW5lcmljTWFwIGFzIE1hcCB9IGZyb20gJy4vY29sbGVjdGlvbnMnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcclxuIFxyXG5leHBvcnQgY2xhc3MgUGxheWVyIGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9sYXN0U2hvdCA6IERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5ID0gbmV3IEJvZHkoeyB4OiAxMCwgeTogMTAgfSwgMzYsIDM2KTtcclxuXHRwdWJsaWMgc3BlZWQ6IG51bWJlciA9IDM7XHJcblx0cHVibGljIGF0dGFja1NwZWVkID0gMTUwO1xyXG5cclxuXHRwdWJsaWMgY3VycmVudEFuaW1hdGlvbiA6IEFuaW1hdGlvbjtcclxuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XHJcblx0ICAgICdpZGxlJyA6IG5ldyBBbmltYXRpb24obmV3IEZyYW1lKDEsIDAsIG5ldyBTcHJpdGUoe3g6IDAsIHk6IDB9LCAzNiwgMzYpKSksXHJcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKG5ldyBGcmFtZSg0LCAwLCBuZXcgU3ByaXRlKHt4OiAwLCB5OiAwfSwgMzYsIDM2KSkpLFxyXG5cdCAgICAnbGVmdCcgOiBuZXcgQW5pbWF0aW9uKG5ldyBGcmFtZSg0LCAxLCBuZXcgU3ByaXRlKHt4OiAwLCB5OiAwfSwgMzYsIDM2KSkpXHJcblx0fTtcclxuXHRwcml2YXRlIF9idWxsZXRPZmZzZXQgOiBQb2ludCA9IHsgeDogMTIsIHk6IDE4IH07IFxyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgnaWRsZScpO1xyXG5cdH1cclxuXHJcblx0c2hvb3QoKSA6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuY2FuU2hvb3QoKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0U2hvdCA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdGxldCBidWxsZXRTcGF3biA9IE9iamVjdC5hc3NpZ24oe30sIFV0aWwuYWRkUG9pbnQodGhpcy5ib2R5LnBvc2l0aW9uLCB0aGlzLl9idWxsZXRPZmZzZXQpKTtcclxuXHJcblx0XHRcdGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGJ1bGxldFNwYXduLCB0aGlzLl9nYW1lLm1vdXNlLCB0aGlzKTtcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLnB1c2goYnVsbGV0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgY2FuU2hvb3QoKSA6IGJvb2xlYW4geyBcclxuXHRcdGxldCBkaWZmID0gdGhpcy5fZ2FtZS5nYW1lVGltZS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2hvdC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLmF0dGFja1NwZWVkO1xyXG5cdH1cclxuXHJcblx0YW5pbWF0ZShhbmltYXRpb24gOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbnNbYW5pbWF0aW9uXTtcclxuXHRcdHRoaXMuY3VycmVudEFuaW1hdGlvbi5zcGVlZCA9IDEwMDtcclxuXHR9XHJcblxyXG5cdHVwYXRlTW92ZW1lbnQoKSA6IHZvaWQge1xyXG5cdFx0bGV0IGlucHV0ID0gdGhpcy5fZ2FtZS5pbnB1dDtcclxuXHJcblx0XHRpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uTGVmdF0pIHtcclxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnggLT0gdGhpcy5zcGVlZDtcclxuXHRcdFx0dGhpcy5hbmltYXRlKCdsZWZ0Jyk7XHJcblxyXG5cdFx0fSBlbHNlIGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5SaWdodF0pIHtcclxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnggKz0gdGhpcy5zcGVlZDtcclxuXHRcdFx0dGhpcy5hbmltYXRlKCdyaWdodCcpO1xyXG5cdFx0fVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5VcF0pIHtcclxuXHJcblx0XHRcdHRoaXMuYm9keS5wb3NpdGlvbi55IC09IHRoaXMuc3BlZWQ7XHJcblxyXG5cdFx0fSBlbHNlIGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5Eb3duXSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnkgKz0gdGhpcy5zcGVlZDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoaW5wdXQuYWN0aW9uc1tBY3Rpb24uQXR0YWNrXSkge1xyXG5cdCAgICAgICAgdGhpcy5zaG9vdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMudXBhdGVNb3ZlbWVudCgpO1xyXG5cdH1cclxufSIsImltcG9ydCB7IEdhbWUsIENvbmZpZyB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gJy4vdmlld3BvcnQnO1xuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyZXIge1xuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcblxuXHRwcml2YXRlIF90aWxlID0geyBcblx0XHR3aWR0aCA6IDMwLFxuXHRcdGhlaWdodDogMzBcblx0fVxuXG5cblx0LyoqXG5cdCAqXHRTcHJpdGVzIEkgdXNlIGZvciBhIGRldmVsb3BtZW50IHdlcmUgY3JlYXRlZCBieSBDb2R5IFNoZXBwIGZvciBoaXMgZ2FtZSBEZW50YWwgRGVmZW5kZXI6IFNhZ2Egb2YgdGhlIENhbmR5IEhvcmRlLlxuXHQgKlx0UGxlYXNlIGNoZWNrIGhpcyBnaXRodWIgcmVwbzogaHR0cHM6Ly9naXRodWIuY29tL2NzaGVwcC9jYW5keWphbS9cblx0ICovXG5cdHByaXZhdGUgX3Jlc291cmNlcyA9IHtcblx0XHQncGxheWVyJyA6ICcuL2ltZy9wbGF5ZXIucG5nJyxcblx0XHQnZW5lbXknIDogJy4vaW1nL2VuZW15LnBuZycsXG5cdFx0J2J1bGxldCcgOiAnLi9pbWcvYnVsbGV0LnBuZydcblx0fVxuXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRpbGUocG9zOiBQb2ludCwgY29sb3I6IHN0cmluZykgOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQucmVjdChwb3MueCwgcG9zLnksIHRoaXMuX3RpbGUud2lkdGgsIHRoaXMuX3RpbGUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyVGlsZXMoKSA6IHZvaWQge1xuICAgICAgICB2YXIgY29sb3JzID0gW1wiIzc4NWM5OFwiLCBcIiM2OTRmODhcIl07XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLl9nYW1lLm1hcC53aWR0aDsgeCArPSB0aGlzLl90aWxlLndpZHRoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuX2dhbWUubWFwLmhlaWdodDsgeSArPSB0aGlzLl90aWxlLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIHZhciB4SW5kZXggPSAoeCAvIHRoaXMuX3RpbGUud2lkdGgpICUgMjtcbiAgICAgICAgICAgICAgICB2YXIgeUluZGV4ID0gKHkgLyB0aGlzLl90aWxlLmhlaWdodCkgJSAyO1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVQb3MgPSB0aGlzLmNhbWVyYU9mZnNldCh7eCwgeX0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaWxlKHRpbGVQb3MsIGNvbG9yc1t4SW5kZXggXiB5SW5kZXhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2FtZXJhT2Zmc2V0KHBvczogUG9pbnQpIDogUG9pbnQge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IHBvcy55IC0gc2VsZi5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XG4gICAgICAgIH07XG4gICAgfVxuXG5cdHByaXZhdGUgcmVuZGVySGVscGVyKHNvdXJjZSA6IHN0cmluZywgY29sbGVjdGlvbiA6IEVudGl0eVtdKSB7XG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXHRcdGltZy5zcmMgPSBzb3VyY2U7XG5cblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHsgXG5cdFx0XHR2YXIgc3ByaXRlID0gZS5jdXJyZW50QW5pbWF0aW9uLmN1cnJlbnRGcmFtZS5zcHJpdGU7XG5cdFx0XHR2YXIgcG9zID0gdGhpcy5jYW1lcmFPZmZzZXQoZS5ib2R5LnBvc2l0aW9uKTtcblxuXHRcdFx0aWYgKHRoaXMuX2dhbWUuY29uZmlnLnNob3dBQUJCKSB7XG5cdFx0XHRcdHRoaXMucmVuZGVyQUFCQihuZXcgQm9keShwb3MsIGUuYm9keS53aWR0aCwgZS5ib2R5LmhlaWdodCkpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLl9nYW1lLmNvbnRleHQuZHJhd0ltYWdlKFxuXHRcdFx0XHRpbWcsIFxuXHRcdFx0XHRzcHJpdGUub2Zmc2V0LngsIHNwcml0ZS5vZmZzZXQueSwgXG5cdFx0XHRcdHNwcml0ZS53aWR0aCwgc3ByaXRlLmhlaWdodCwgXG5cdFx0XHRcdHBvcy54LCBwb3MueSwgXG5cdFx0XHRcdHNwcml0ZS53aWR0aCwgc3ByaXRlLmhlaWdodFxuXHRcdFx0KTtcblxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJBQUJCKGJvZHk6IEJvZHkpIHtcblx0XHR2YXIgY3R4ID0gdGhpcy5fZ2FtZS5jb250ZXh0O1xuXHRcdFxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgudHJhbnNsYXRlKDAuNSwgMC41KTtcblx0XHRjdHgucmVjdChcblx0XHRcdGJvZHkucG9zaXRpb24ueCwgXG5cdFx0XHRib2R5LnBvc2l0aW9uLnksIFxuXHRcdFx0Ym9keS53aWR0aCwgXG5cdFx0XHRib2R5LmhlaWdodFxuXHRcdCk7XG5cblx0XHRjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuXHRcdGN0eC5saW5lV2lkdGggPSAxO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHgudHJhbnNsYXRlKC0wLjUsIC0wLjUpO1xuXHR9XG5cblx0cmVuZGVyKCkgOiB2b2lkIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHR0aGlzLnJlbmRlclRpbGVzKCk7XG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydidWxsZXQnXSwgdGhpcy5fZ2FtZS5idWxsZXRzKTtcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2VuZW15J10sIHRoaXMuX2dhbWUuZW5lbWllcyk7XG5cdFx0dGhpcy5yZW5kZXJIZWxwZXIodGhpcy5fcmVzb3VyY2VzWydwbGF5ZXInXSwgW3RoaXMuX2dhbWUucGxheWVyXSk7XG5cdH1cblxuXHRjbGVhcigpIDogdm9pZCB7XG5cdFx0bGV0IHcgPSB0aGlzLl9nYW1lLmNhbnZhcy53aWR0aDtcblx0XHRsZXQgaCA9IHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodDtcblxuXHRcdHRoaXMuX2dhbWUuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XG5cdH1cbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnOyBcclxuXHJcbmV4cG9ydCBjbGFzcyBTcHJpdGUge1xyXG5cdG9mZnNldCA6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG5cdHdpZHRoIDogbnVtYmVyID0gMDtcclxuXHRoZWlnaHQgOiBudW1iZXIgPSAwO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihvZmZzZXQ6IFBvaW50LCB3aWR0aCA6IG51bWJlciwgaGVpZ2h0IDogbnVtYmVyKSB7XHJcblx0XHR0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cdH1cclxufSIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcblxyXG5leHBvcnQgY2xhc3MgVXBkYXRlciB7XHJcblx0cHJpdmF0ZSBfZ2FtZSA6IEdhbWU7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZSA6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFsbEVudGl0aWVzKCkgOiBFbnRpdHlbXSB7XHJcblx0XHRyZXR1cm4gPEVudGl0eVtdPiBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxyXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMsXHJcblx0XHRcdHRoaXMuX2dhbWUuZW5lbWllcyxcclxuXHRcdFx0dGhpcy5fZ2FtZS5wbGF5ZXJcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZUFuaW1hdGlvbnMoKSA6IHZvaWQge1xyXG5cdFx0dmFyIGVudGl0aWVzID0gdGhpcy5hbGxFbnRpdGllcygpO1xyXG5cclxuXHRcdGVudGl0aWVzLmZvckVhY2goKGUpPT4geyBlLmN1cnJlbnRBbmltYXRpb24udXBkYXRlKHRoaXMuX2dhbWUuZ2FtZVRpbWUpOyB9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlRW50aXRpZXMoKSA6IHZvaWQge1xyXG5cdFx0dmFyIGVudGl0aWVzID0gdGhpcy5hbGxFbnRpdGllcygpO1xyXG5cclxuXHRcdGVudGl0aWVzLmZvckVhY2goZSA9PiB7IGUudXBkYXRlKCk7IH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVEZWFkKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuX2dhbWUuYnVsbGV0cy5mb3JFYWNoKGUgPT4geyB0aGlzLnJlbW92ZURlYWQoZSwgdGhpcy5fZ2FtZS5idWxsZXRzKTsgfSlcclxuXHRcdHRoaXMuX2dhbWUuZW5lbWllcy5mb3JFYWNoKGUgPT4geyB0aGlzLnJlbW92ZURlYWQoZSwgdGhpcy5fZ2FtZS5lbmVtaWVzKTsgfSlcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVtb3ZlRGVhZChlOiBFbnRpdHksIGNvbGxlY3Rpb246IEVudGl0eVtdKSB7XHJcblx0XHRpZiAoZS5hbGl2ZSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0dmFyIGVJbmRleCA9IGNvbGxlY3Rpb24uaW5kZXhPZihlKTtcclxuXHJcblx0XHRcdGlmIChlSW5kZXggPiAtMSkge1xyXG5cdFx0XHRcdGNvbGxlY3Rpb24uc3BsaWNlKGVJbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLnVwZGF0ZUFuaW1hdGlvbnMoKTtcclxuXHRcdHRoaXMudXBkYXRlRW50aXRpZXMoKTtcclxuXHRcdHRoaXMudXBkYXRlRGVhZCgpO1xyXG5cdFx0dGhpcy5fZ2FtZS52aWV3cG9ydC51cGRhdGUoKTtcclxuXHRcdHRoaXMuX2dhbWUuY29sbGlzaW9ucy51cGRhdGUoKTtcclxuXHRcdHRoaXMuX2dhbWUuaW5wdXQudXBkYXRlKCk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcclxuXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuXHRzdGF0aWMgY2xhbXAodmFsdWUgOiBudW1iZXIsIG1pbiA6IG51bWJlciwgbWF4IDogbnVtYmVyKSA6IG51bWJlciB7XHJcblx0XHRpZiAodmFsdWUgPiBtYXgpIHsgcmV0dXJuIG1heDsgfVxyXG5cdFx0aWYgKHZhbHVlIDwgbWluKSB7IHJldHVybiBtaW47IH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgYWRkUG9pbnQocG9pbnQxOiBQb2ludCwgcG9pbnQyOiBQb2ludCkgOiBQb2ludCB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4IDogcG9pbnQxLnggKyBwb2ludDIueCxcclxuXHRcdFx0eSA6IHBvaW50MS55ICsgcG9pbnQyLnlcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnLi91dGlsJztcclxuXHJcbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XHJcblx0cHVibGljIHRhcmdldDogUG9pbnQ7XHJcblx0cHVibGljIHBvc2l0aW9uOiBQb2ludCA9IHsgeCA6IDAsIHkgOiAwIH07XHJcblxyXG5cdHByaXZhdGUgX2dhbWU6IEdhbWU7XHJcblx0cHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcclxuXHRwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlOiBHYW1lKSB7XHJcblx0XHR0aGlzLl9nYW1lID0gZ2FtZUluc3RhbmNlO1xyXG5cdFx0dGhpcy5fd2lkdGggPSBnYW1lSW5zdGFuY2UuY2FudmFzLndpZHRoO1xyXG5cdFx0dGhpcy5faGVpZ2h0ID0gZ2FtZUluc3RhbmNlLmNhbnZhcy5oZWlnaHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNhbGN1bGF0ZVBvc2l0aW9uKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMucG9zaXRpb24ueCA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueCAtIHRoaXMuX3dpZHRoIC8gMiwgMCwgdGhpcy5fZ2FtZS5tYXAud2lkdGggLSB0aGlzLl93aWR0aCk7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnkgPSBVdGlsLmNsYW1wKHRoaXMudGFyZ2V0LnkgLSB0aGlzLl9oZWlnaHQgLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC5oZWlnaHQgLSB0aGlzLl9oZWlnaHQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuXHR9XHJcbn0iXX0=
