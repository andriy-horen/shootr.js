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
            'idle': new animation_1.Animation(new frame_1.Frame(1, 2, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36))),
            'right': new animation_1.Animation(new frame_1.Frame(4, 2, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36))),
            'left': new animation_1.Animation(new frame_1.Frame(4, 3, new sprite_1.Sprite({ x: 0, y: 0 }, 36, 36)))
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
    showAABB: true
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
            'player': 'https://raw.githubusercontent.com/cshepp/candyjam/master/assets/spritesheets/player.png',
            'enemy': 'https://raw.githubusercontent.com/cshepp/candyjam/master/assets/spritesheets/player.png',
            'bullet': 'https://raw.githubusercontent.com/cshepp/candyjam/master/assets/images/bullet.png'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYW5pbWF0aW9uLnRzIiwic3JjL2pzL2JvZHkudHMiLCJzcmMvanMvYnVsbGV0LnRzIiwic3JjL2pzL2NvbGxpc2lvbi1tYW5hZ2VyLnRzIiwic3JjL2pzL2VuZW15LnRzIiwic3JjL2pzL2VudGl0eS50cyIsInNyYy9qcy9mcmFtZS50cyIsInNyYy9qcy9nYW1lLnRzIiwic3JjL2pzL2lucHV0LnRzIiwic3JjL2pzL21hcC50cyIsInNyYy9qcy9waHlzaWNzLnRzIiwic3JjL2pzL3BsYXllci50cyIsInNyYy9qcy9yZW5kZXJlci50cyIsInNyYy9qcy9zcHJpdGUudHMiLCJzcmMvanMvdXBkYXRlci50cyIsInNyYy9qcy91dGlsLnRzIiwic3JjL2pzL3ZpZXdwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0VBO0lBTUMsWUFBWSxLQUFhO1FBSmxCLFVBQUssR0FBWSxDQUFDLENBQUM7UUFFbEIsa0JBQWEsR0FBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUcxQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVc7UUFDckIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFekQsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBYztRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztZQUU5QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7SUFDRixDQUFDO0lBRUQsS0FBSztRQUNKLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0FBQ0YsQ0FBQztBQTVCWSxpQkFBUyxZQTRCckIsQ0FBQTs7O0FDNUJEO0lBT0MsWUFBWSxRQUFlLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFMMUQsYUFBUSxHQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFNaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU07UUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNwQyxDQUFDO0FBQ0YsQ0FBQztBQWpCWSxZQUFJLE9BaUJoQixDQUFBOzs7QUNuQkQseUJBQXVCLFVBQVUsQ0FBQyxDQUFBO0FBQ2xDLHVCQUFxQixRQUFRLENBQUMsQ0FBQTtBQUU5Qiw0QkFBMEIsYUFBYSxDQUFDLENBQUE7QUFDeEMsd0JBQXNCLFNBQVMsQ0FBQyxDQUFBO0FBQ2hDLHlCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUVsQyxxQkFBNEIsZUFBTTtJQVFqQyxZQUFZLFFBQWUsRUFBRSxNQUFhLEVBQUUsTUFBZTtRQUMxRCxPQUFPLENBQUM7UUFORixVQUFLLEdBQVksRUFBRSxDQUFDO1FBQ3BCLGlCQUFZLEdBQVksRUFBRSxDQUFDO1FBQzNCLFNBQUksR0FBVSxJQUFJLFdBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1QyxxQkFBZ0IsR0FBYyxJQUFJLHFCQUFTLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLGVBQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFLdkcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZTtRQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMs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QUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDbkMsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFlO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDaEQsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUVoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFHN0IsRUFBRSxDQUFDLENB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QlksZ0JBQVEsV0FzQnBCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xyXG5cdHB1YmxpYyBjdXJyZW50RnJhbWUgOiBGcmFtZTtcclxuXHRwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAwO1xyXG5cclxuXHRwcml2YXRlIF9sYXN0QW5pbWF0ZWQgOiBEYXRlID0gbmV3IERhdGUoMCk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGZyYW1lIDogRnJhbWUpIHtcclxuXHRcdHRoaXMuY3VycmVudEZyYW1lID0gZnJhbWU7XHJcblx0fVxyXG5cclxuXHRjYW5BbmltYXRlKHRpbWUgOiBEYXRlKSA6IGJvb2xlYW4ge1xyXG5cdFx0dmFyIGRpZmYgPSB0aW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RBbmltYXRlZC5nZXRUaW1lKCk7XHJcblxyXG5cdFx0cmV0dXJuIGRpZmYgPiB0aGlzLnNwZWVkO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKGdhbWVUaW1lOiBEYXRlKSB7XHJcblx0XHRpZiAodGhpcy5jYW5BbmltYXRlKGdhbWVUaW1lKSkge1xyXG5cdFx0XHR0aGlzLl9sYXN0QW5pbWF0ZWQgPSBnYW1lVGltZTtcclxuXHJcblx0XHRcdHRoaXMuY3VycmVudEZyYW1lLm5leHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJlc2V0KCkge1xyXG5cdFx0dGhpcy5fbGFzdEFuaW1hdGVkID0gbmV3IERhdGUoMCk7XHJcblx0XHR0aGlzLmN1cnJlbnRGcmFtZS5yZXNldCgpO1xyXG5cdH1cclxufSAiLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvZHkge1xyXG5cdHBvc2l0aW9uIDogUG9pbnQ7XHJcblx0dmVsb2NpdHk6IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG5cdHdpZHRoIDogbnVtYmVyO1xyXG5cdGhlaWdodCA6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3IocG9zaXRpb246IFBvaW50LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSB7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnggKz0gdGhpcy52ZWxvY2l0eS54O1xyXG5cdFx0dGhpcy5wb3NpdGlvbi55ICs9IHRoaXMudmVsb2NpdHkueTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcbmltcG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSc7XHJcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCdWxsZXQgZXh0ZW5kcyBFbnRpdHkge1xyXG5cdHB1YmxpYyB0YXJnZXQgOiBQb2ludDtcclxuXHRwdWJsaWMgcGFyZW50IDogRW50aXR5O1xyXG5cdHB1YmxpYyBzcGVlZCA6IG51bWJlciA9IDEwO1xyXG5cdHB1YmxpYyBkYW1hZ2VBbW91bnQgOiBudW1iZXIgPSAxMDtcclxuXHRwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keSh7IHg6IDAsIHk6IDB9LCAzLCAzKTtcdFxyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uOiBBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKG5ldyBGcmFtZSgxLCAwLCBuZXcgU3ByaXRlKHsgeDogMCwgeTogMCB9LCAxMCwgMTApKSk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb2ludCwgdGFyZ2V0OiBQb2ludCwgcGFyZW50IDogRW50aXR5KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuYm9keS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuXHJcblx0XHR0aGlzLnNldFZlbG9jaXR5KHRoaXMudGFyZ2V0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0VmVsb2NpdHkocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xyXG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcbiAgICAgICAgdmFyIGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgdmFyIGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB4ID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xyXG4gICAgICAgIHZhciB5ID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkgPSB7IHgsIHkgfTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLmJvZHkudXBkYXRlKCk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IFBoeXNpY3MgfSBmcm9tICcuL3BoeXNpY3MnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbGxpc2lvbk1hbmFnZXIgeyBcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLl9nYW1lLmVuZW1pZXMuZm9yRWFjaCgoZW5lbXkpID0+IHtcclxuXHRcdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goKGJ1bGxldCkgPT4ge1xyXG5cdFx0XHRcdFBoeXNpY3MuY29sbGlkZShlbmVteS5ib2R5LCBidWxsZXQuYm9keSwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0ZW5lbXkuZGFtYWdlKGJ1bGxldC5kYW1hZ2VBbW91bnQsIGJ1bGxldC5wYXJlbnQpO1xyXG5cclxuXHRcdFx0XHRcdGJ1bGxldC5raWxsKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBHZW5lcmljTWFwIGFzIE1hcCB9IGZyb20gJy4vY29sbGVjdGlvbnMnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9hbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15IGV4dGVuZHMgRW50aXR5IHtcclxuXHRwcml2YXRlIF9hbmltYXRpb25zIDogTWFwPEFuaW1hdGlvbj4gPSB7XHJcblx0ICAgICdpZGxlJyA6IG5ldyBBbmltYXRpb24obmV3IEZyYW1lKDEsIDIsIG5ldyBTcHJpdGUoeyB4OiAwLCB5OiAwIH0sIDM2LCAzNiApKSksXHJcblx0ICAgICdyaWdodCcgOiBuZXcgQW5pbWF0aW9uKG5ldyBGcmFtZSg0LCAyLCBuZXcgU3ByaXRlKHsgeDogMCwgeTogMCB9LCAzNiwgMzYgKSkpLCBcclxuXHQgICAgJ2xlZnQnIDogbmV3IEFuaW1hdGlvbihuZXcgRnJhbWUoNCwgMywgbmV3IFNwcml0ZSh7IHg6IDAsIHk6IDAgfSwgMzYsIDM2ICkpKSBcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGN1cnJlbnRBbmltYXRpb24gOiBBbmltYXRpb247XHJcbiAgICBwdWJsaWMgc3BlZWQgOiBudW1iZXIgPSAzO1xyXG4gICAgcHVibGljIHRhcmdldCA6IEVudGl0eTtcclxuICAgIHB1YmxpYyBib2R5IDogQm9keSA9IG5ldyBCb2R5KHsgeDogMTAwLCB5OiAxMDAgfSwgMzYsIDM2KTtcclxuXHJcblx0Y29uc3RydWN0b3IodGFyZ2V0OiBFbnRpdHkpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cclxuXHRcdHRoaXMuYW5pbWF0ZSgncmlnaHQnKTtcclxuXHR9XHJcblxyXG5cdGFuaW1hdGUoYW5pbWF0aW9uIDogc3RyaW5nKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTAwO1xyXG5cdH1cclxuXHJcblx0bW92ZVRvd2FyZHMocG9zaXRpb246IFBvaW50KSA6IHZvaWQge1xyXG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCk7XHJcbiAgICAgICAgdmFyIGR5ID0gTWF0aC5hYnMocG9zaXRpb24ueSAtIHRoaXMuYm9keS5wb3NpdGlvbi55KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZGlyWCA9IHBvc2l0aW9uLnggLSB0aGlzLmJvZHkucG9zaXRpb24ueCA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgdmFyIGRpclkgPSBwb3NpdGlvbi55IC0gdGhpcy5ib2R5LnBvc2l0aW9uLnkgPiAwID8gMSA6IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB2ZWxYID0gZHggKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJYO1xyXG4gICAgICAgIHZhciB2ZWxZID0gZHkgKiAodGhpcy5zcGVlZCAvIChkeCArIGR5KSkgKiBkaXJZO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYm9keS5wb3NpdGlvbi54ICs9IHZlbFg7XHJcbiAgICAgICAgdGhpcy5ib2R5LnBvc2l0aW9uLnkgKz0gdmVsWTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZGlyWCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCdyaWdodCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgnbGVmdCcpO1xyXG4gICAgICAgIH1cclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIDogdm9pZCB7XHJcblx0XHR0aGlzLm1vdmVUb3dhcmRzKHRoaXMudGFyZ2V0LmJvZHkucG9zaXRpb24pO1xyXG5cdH1cclxufSIsImltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5IHtcclxuXHRwcml2YXRlIF9oZWFsdGggOiBudW1iZXIgPSAxMDA7XHJcblx0cHJpdmF0ZSBfYWxpdmUgOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwcml2YXRlIF9hdHRhY2tlciA6IEVudGl0eTtcclxuXHJcblx0cHVibGljIGJvZHkgOiBCb2R5O1xyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cclxuXHRnZXQgaGVhbHRoKCkgOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2hlYWx0aDtcclxuXHR9XHJcblxyXG5cdGdldCBhbGl2ZSgpIDogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYWxpdmU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9zZXRIZWFsdGgobnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdGlmICh0aGlzLl9oZWFsdGggPiAwICYmIHRoaXMuX2FsaXZlKSB7XHJcblx0XHRcdHRoaXMuX2hlYWx0aCArPSBudW1iZXI7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2hlYWx0aCA8PSAwKSB7XHJcblx0XHRcdHRoaXMua2lsbCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0a2lsbCgpIHtcclxuXHRcdHRoaXMuX2hlYWx0aCA9IDA7XHJcblx0XHR0aGlzLl9hbGl2ZSA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0ZGFtYWdlKGFtb3VudCA6IG51bWJlciwgYXR0YWNrZXI6IEVudGl0eSkgOiB2b2lkIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aCgtYW1vdW50KTtcclxuXHJcblx0XHR0aGlzLl9hdHRhY2tlciA9IGF0dGFja2VyO1xyXG5cdH1cclxuXHJcblx0aGVhbChhbW91bnQgOiBudW1iZXIpIHtcclxuXHRcdHRoaXMuX3NldEhlYWx0aChhbW91bnQpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge31cclxufSIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4vc3ByaXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZSB7XHJcblx0cHVibGljIGluZGV4IDogbnVtYmVyID0gMDtcclxuXHRwdWJsaWMgc3ByaXRlIDogU3ByaXRlO1xyXG5cclxuXHRwcml2YXRlIF9sZW5ndGggOiBudW1iZXI7XHJcblx0cHJpdmF0ZSBfcm93IDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihsZW5ndGggOiBudW1iZXIsIHJvdyA6IG51bWJlciwgc3ByaXRlIDogU3ByaXRlKSB7XHJcblx0XHR0aGlzLl9sZW5ndGggPSBsZW5ndGg7XHJcblx0XHR0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuXHJcblx0XHR0aGlzLnNwcml0ZS5vZmZzZXQueSA9IHRoaXMuc3ByaXRlLmhlaWdodCAqIHJvdztcclxuXHR9XHJcblxyXG5cdG5leHQoKSB7XHJcblx0XHR0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXggKyAxKSAlIHRoaXMuX2xlbmd0aDtcclxuXHJcblx0XHR0aGlzLnNwcml0ZS5vZmZzZXQueCA9IHRoaXMuc3ByaXRlLndpZHRoICogdGhpcy5pbmRleDtcclxuXHR9XHJcblxyXG5cdHJlc2V0KCkge1xyXG5cdFx0dGhpcy5pbmRleCA9IDA7XHJcblx0XHR0aGlzLnNwcml0ZS5vZmZzZXQgPSB7IHggOiAwLCB5IDogMH07XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9idWxsZXQnO1xyXG5pbXBvcnQgeyBDb2xsaXNpb25NYW5hZ2VyIH0gZnJvbSAnLi9jb2xsaXNpb24tbWFuYWdlcic7XHJcbmltcG9ydCB7IEVuZW15IH0gZnJvbSAnLi9lbmVteSc7XHJcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vbWFwJztcclxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSAnLi9wbGF5ZXInO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyZXInO1xyXG5pbXBvcnQgeyBVcGRhdGVyIH0gZnJvbSAnLi91cGRhdGVyJzsgXHJcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSAnLi92aWV3cG9ydCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XHJcblx0Y29udGFpbmVyIDogc3RyaW5nO1xyXG5cdHNob3dBQUJCIDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG5cdHB1YmxpYyBjb25maWcgOiBDb25maWc7XHJcblx0cHVibGljIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cdHB1YmxpYyBpc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRwdWJsaWMgcGxheWVyOiBQbGF5ZXI7XHJcblx0cHVibGljIGJ1bGxldHM6IEJ1bGxldFtdID0gW107XHJcblx0cHVibGljIGVuZW1pZXM6IEVuZW15W10gPSBbXTtcclxuXHJcblx0cHVibGljIGdhbWVUaW1lOiBEYXRlO1xyXG5cclxuXHRwdWJsaWMgbWFwOiBNYXA7XHJcblx0cHVibGljIGlucHV0OiBJbnB1dDtcclxuXHRwdWJsaWMgdmlld3BvcnQ6IFZpZXdwb3J0O1xyXG5cdHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXI7XHJcblx0cHVibGljIHVwZGF0ZXI6IFVwZGF0ZXI7XHJcblx0cHVibGljIGNvbGxpc2lvbnM6IENvbGxpc2lvbk1hbmFnZXI7XHJcblx0cHVibGljIG1vdXNlOiBQb2ludDtcclxuXHQvKipcclxuXHQgKiBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdW5pcXVlIElEOyB1c2VkIHRvIGNhbmNlbCBSQUYtbG9vcFxyXG5cdCAqIEB0eXBlIHtudW1iZXJ9XHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcmFmSWQgOiBudW1iZXI7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XHJcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHRcdHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5jb250YWluZXIpO1xyXG5cdFx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcblx0XHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIodGhpcyk7XHJcblx0XHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxuXHRcdHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQodGhpcyk7XHJcblx0XHR0aGlzLnZpZXdwb3J0ID0gbmV3IFZpZXdwb3J0KHRoaXMpO1xyXG5cdFx0dGhpcy52aWV3cG9ydC50YXJnZXQgPSB0aGlzLnBsYXllci5ib2R5LnBvc2l0aW9uO1xyXG5cclxuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIodGhpcyk7XHJcblx0XHR0aGlzLnVwZGF0ZXIgPSBuZXcgVXBkYXRlcih0aGlzKTtcclxuXHRcdHRoaXMuY29sbGlzaW9ucyA9IG5ldyBDb2xsaXNpb25NYW5hZ2VyKHRoaXMpO1xyXG5cdFx0dGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMucGxheWVyKSk7XHJcblx0fVxyXG5cclxuXHR0aWNrKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMuZ2FtZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZXIudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0cnVuKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZyA9PT0gZmFsc2UpIHtcclxuXHRcdFx0dGhpcy50aWNrKCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdG9wKCkgOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUnVubmluZykge1xyXG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XHJcblxyXG5cdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxudmFyIGdhbWUgPSBuZXcgR2FtZSh7XHJcblx0Y29udGFpbmVyOiAnLmdhbWUnLFxyXG5cdHNob3dBQUJCOiB0cnVlXHJcbn0pO1xyXG5cclxuZ2FtZS5ydW4oKTsiLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3BvaW50JztcclxuaW1wb3J0IHsgR2VuZXJpY01hcCBhcyBNYXAgfSBmcm9tICcuL2NvbGxlY3Rpb25zJztcclxuXHJcbmV4cG9ydCBlbnVtIEFjdGlvbiB7IFxyXG5cdFVwLCBcclxuXHREb3duLFxyXG5cdExlZnQsXHJcblx0UmlnaHQsXHJcblx0QXR0YWNrXHJcbn1cclxuXHJcbmVudW0gS2V5IHtcclxuXHRXID0gODcsXHJcblx0QSA9IDY1LFxyXG5cdFMgPSA4MyxcclxuXHREID0gNjgsXHJcblx0VXAgPSAzOCxcclxuXHREb3duID0gNDAsXHJcblx0TGVmdCA9IDM3LFxyXG5cdFJpZ2h0ID0gMzlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0IHtcclxuXHRwcml2YXRlIF9iaW5kaW5ncyA6IE1hcDxBY3Rpb24+ID0ge1xyXG5cdFx0W0tleS5XXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuQV0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuU10gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuRF0gOiBBY3Rpb24uUmlnaHQsXHJcblx0XHRbS2V5LlVwXSA6IEFjdGlvbi5VcCxcclxuXHRcdFtLZXkuRG93bl0gOiBBY3Rpb24uRG93bixcclxuXHRcdFtLZXkuTGVmdF0gOiBBY3Rpb24uTGVmdCxcclxuXHRcdFtLZXkuUmlnaHRdIDogQWN0aW9uLlJpZ2h0XHJcblx0fTtcclxuXHJcblx0cHVibGljIGFjdGlvbnMgOiBNYXA8Ym9vbGVhbj4gPSB7fTtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHRwcml2YXRlIF9tb3VzZVBvczogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0YmluZChrZXk6IEtleSwgYWN0aW9uOiBBY3Rpb24pIHtcclxuXHRcdHRoaXMudW5iaW5kKGtleSk7XHJcblxyXG5cdFx0dGhpcy5fYmluZGluZ3Nba2V5XSA9IGFjdGlvbjtcclxuXHR9XHJcblxyXG5cdHVuYmluZChrZXk6IEtleSkge1xyXG5cdFx0aWYgKHRoaXMuX2JpbmRpbmdzW2tleV0pIHtcclxuXHRcdFx0ZGVsZXRlIHRoaXMuX2JpbmRpbmdzW2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7IFxyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IHRydWU7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uS2V5VXAoZTogS2V5Ym9hcmRFdmVudCkge1xyXG5cdFx0bGV0IGFjdGlvbiA9IHRoaXMuX2JpbmRpbmdzW2Uud2hpY2hdO1xyXG5cclxuXHRcdGlmIChhY3Rpb24gIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uXSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XHJcblx0XHRjb25zdCBsZWZ0QnV0dG9uID0gMDtcclxuXHJcblx0XHR0aGlzLmdldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRpZiAoZS5idXR0b24gPT0gbGVmdEJ1dHRvbikge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbQWN0aW9uLkF0dGFja10gPSB0cnVlO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBvbk1vdXNlVXAoZTogTW91c2VFdmVudCkge1xyXG5cdFx0Y29uc3QgbGVmdEJ1dHRvbiA9IDA7XHJcblxyXG5cdFx0aWYgKGUuYnV0dG9uID09IGxlZnRCdXR0b24pIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdID0gZmFsc2U7XHJcblxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIDogTmVlZHMgYmV0dGVyIGltcGxlbWVudGF0aW9uXHJcblx0cHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGU6IE1vdXNlRXZlbnQpIHsgXHJcblx0XHR2YXIgY2FudmFzT2Zmc2V0ID0gdGhpcy5fZ2FtZS5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0dGhpcy5fbW91c2VQb3MgPSB7XHJcblx0ICAgICAgeDogZS5jbGllbnRYIC0gY2FudmFzT2Zmc2V0LmxlZnQsXHJcblx0ICAgICAgeTogZS5jbGllbnRZIC0gY2FudmFzT2Zmc2V0LnRvcFxyXG5cdCAgICB9O1xyXG5cclxuXHQgICBcdHRoaXMuX2dhbWUubW91c2UgPSB7XHJcblx0XHRcdHg6IHRoaXMuX21vdXNlUG9zLnggKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLngsXHJcblx0XHRcdHk6IHRoaXMuX21vdXNlUG9zLnkgKyB0aGlzLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR0aGlzLl9nYW1lLm1vdXNlID0ge1xyXG5cdFx0XHR4OiB0aGlzLl9tb3VzZVBvcy54ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi54LFxyXG5cdFx0XHR5OiB0aGlzLl9tb3VzZVBvcy55ICsgdGhpcy5fZ2FtZS52aWV3cG9ydC5wb3NpdGlvbi55XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZXhwb3J0IGNsYXNzIE1hcCB7IFxyXG5cdHB1YmxpYyB3aWR0aCA6IG51bWJlciA9IDIwMDA7XHJcblx0cHVibGljIGhlaWdodCA6IG51bWJlciA9IDE1MDA7XHJcbn0iLCJpbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9ib2R5JztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUGh5c2ljcyB7XHJcblx0IC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHR3byByZWN0YW5ndWxhciBib2RpZXMgaW50ZXJzZWN0XHJcbiAgICAgKiBAcGFyYW0gIHtSZWN0fSBib2R5MSBGaXJzdCBib2R5IHdpdGgge3gseX0gcG9zaXRpb24gYW5kIHt3aWR0aCwgaGVpZ2h0fVxyXG4gICAgICogQHBhcmFtICB7UmVjdH0gYm9keTIgU2Vjb25kIGJvZHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhleSBpbnRlcnNlY3QsIG90aGVyd2lzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhib2R5MTogQm9keSwgYm9keTI6IEJvZHkpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgdmFyIGludGVyc2VjdGlvblggPSBib2R5MS5wb3NpdGlvbi54IDwgYm9keTIucG9zaXRpb24ueCArIGJvZHkyLndpZHRoIFxyXG4gICAgICAgIFx0XHRcdFx0ICYmIGJvZHkxLnBvc2l0aW9uLnggKyBib2R5MS53aWR0aCA+IGJvZHkyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGludGVyc2VjdGlvblkgPSBib2R5MS5wb3NpdGlvbi55IDwgYm9keTIucG9zaXRpb24ueSArIGJvZHkyLmhlaWdodCBcclxuICAgICAgICBcdFx0XHRcdCAmJiBib2R5MS5wb3NpdGlvbi55ICsgYm9keTEuaGVpZ2h0ID4gYm9keTIucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblggJiYgaW50ZXJzZWN0aW9uWTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY29sbGlkZShib2R5MTogQm9keSwgYm9keTI6IEJvZHksIGNvbGxpc2lvbkNhbGxiYWNrOiBGdW5jdGlvbikgOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGJvZHkxLCBib2R5MikpIHtcclxuICAgICAgICAgICAgY29sbGlzaW9uQ2FsbGJhY2soKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi9lbnRpdHknO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL2lucHV0JztcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vYm9keSc7XHJcbmltcG9ydCB7IEJ1bGxldCB9IGZyb20gJy4vYnVsbGV0JztcclxuaW1wb3J0IHsgRnJhbWUgfSBmcm9tICcuL2ZyYW1lJztcclxuaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi9zcHJpdGUnO1xyXG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2FuaW1hdGlvbic7XHJcbmltcG9ydCB7IEdlbmVyaWNNYXAgYXMgTWFwIH0gZnJvbSAnLi9jb2xsZWN0aW9ucyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xyXG4gXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIgZXh0ZW5kcyBFbnRpdHkge1xyXG5cdHByaXZhdGUgX2dhbWUgOiBHYW1lO1xyXG5cdHByaXZhdGUgX2xhc3RTaG90IDogRGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cclxuXHRwdWJsaWMgYm9keSA6IEJvZHkgPSBuZXcgQm9keSh7IHg6IDEwLCB5OiAxMCB9LCAzNiwgMzYpO1xyXG5cdHB1YmxpYyBzcGVlZDogbnVtYmVyID0gMztcclxuXHRwdWJsaWMgYXR0YWNrU3BlZWQgPSAxNTA7XHJcblxyXG5cdHB1YmxpYyBjdXJyZW50QW5pbWF0aW9uIDogQW5pbWF0aW9uO1xyXG5cdHByaXZhdGUgX2FuaW1hdGlvbnMgOiBNYXA8QW5pbWF0aW9uPiA9IHtcclxuXHQgICAgJ2lkbGUnIDogbmV3IEFuaW1hdGlvbihuZXcgRnJhbWUoMSwgMCwgbmV3IFNwcml0ZSh7eDogMCwgeTogMH0sIDM2LCAzNikpKSxcclxuXHQgICAgJ3JpZ2h0JyA6IG5ldyBBbmltYXRpb24obmV3IEZyYW1lKDQsIDAsIG5ldyBTcHJpdGUoe3g6IDAsIHk6IDB9LCAzNiwgMzYpKSksXHJcblx0ICAgICdsZWZ0JyA6IG5ldyBBbmltYXRpb24obmV3IEZyYW1lKDQsIDEsIG5ldyBTcHJpdGUoe3g6IDAsIHk6IDB9LCAzNiwgMzYpKSlcclxuXHR9O1xyXG5cdHByaXZhdGUgX2J1bGxldE9mZnNldCA6IFBvaW50ID0geyB4OiAxMiwgeTogMTggfTsgXHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCdpZGxlJyk7XHJcblx0fVxyXG5cclxuXHRzaG9vdCgpIDogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5jYW5TaG9vdCgpKSB7XHJcblx0XHRcdHRoaXMuX2xhc3RTaG90ID0gbmV3IERhdGUoKTtcclxuXHRcdFx0bGV0IGJ1bGxldFNwYXduID0gT2JqZWN0LmFzc2lnbih7fSwgVXRpbC5hZGRQb2ludCh0aGlzLmJvZHkucG9zaXRpb24sIHRoaXMuX2J1bGxldE9mZnNldCkpO1xyXG5cclxuXHRcdFx0bGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoYnVsbGV0U3Bhd24sIHRoaXMuX2dhbWUubW91c2UsIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9nYW1lLmJ1bGxldHMucHVzaChidWxsZXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjYW5TaG9vdCgpIDogYm9vbGVhbiB7IFxyXG5cdFx0bGV0IGRpZmYgPSB0aGlzLl9nYW1lLmdhbWVUaW1lLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RTaG90LmdldFRpbWUoKTtcclxuXHJcblx0XHRyZXR1cm4gZGlmZiA+IHRoaXMuYXR0YWNrU3BlZWQ7XHJcblx0fVxyXG5cclxuXHRhbmltYXRlKGFuaW1hdGlvbiA6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uc1thbmltYXRpb25dO1xyXG5cdFx0dGhpcy5jdXJyZW50QW5pbWF0aW9uLnNwZWVkID0gMTAwO1xyXG5cdH1cclxuXHJcblx0dXBhdGVNb3ZlbWVudCgpIDogdm9pZCB7XHJcblx0XHRsZXQgaW5wdXQgPSB0aGlzLl9nYW1lLmlucHV0O1xyXG5cclxuXHRcdGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5MZWZ0XSkge1xyXG5cdFx0XHR0aGlzLmJvZHkucG9zaXRpb24ueCAtPSB0aGlzLnNwZWVkO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGUoJ2xlZnQnKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKGlucHV0LmFjdGlvbnNbQWN0aW9uLlJpZ2h0XSkge1xyXG5cdFx0XHR0aGlzLmJvZHkucG9zaXRpb24ueCArPSB0aGlzLnNwZWVkO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGUoJ3JpZ2h0Jyk7XHJcblx0XHR9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGlucHV0LmFjdGlvbnNbQWN0aW9uLlVwXSkge1xyXG5cclxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnkgLT0gdGhpcy5zcGVlZDtcclxuXHJcblx0XHR9IGVsc2UgaWYgKGlucHV0LmFjdGlvbnNbQWN0aW9uLkRvd25dKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmJvZHkucG9zaXRpb24ueSArPSB0aGlzLnNwZWVkO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChpbnB1dC5hY3Rpb25zW0FjdGlvbi5BdHRhY2tdKSB7XHJcblx0ICAgICAgICB0aGlzLnNob290KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy51cGF0ZU1vdmVtZW50KCk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgR2FtZSwgQ29uZmlnIH0gZnJvbSAnLi9nYW1lJztcclxuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tICcuL3ZpZXdwb3J0JztcclxuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHJcblx0cHJpdmF0ZSBfdGlsZSA9IHsgXHJcblx0XHR3aWR0aCA6IDMwLFxyXG5cdFx0aGVpZ2h0OiAzMFxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfcmVzb3VyY2VzID0ge1xyXG5cdFx0J3BsYXllcicgOiAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2NzaGVwcC9jYW5keWphbS9tYXN0ZXIvYXNzZXRzL3Nwcml0ZXNoZWV0cy9wbGF5ZXIucG5nJyxcclxuXHRcdCdlbmVteScgOiAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2NzaGVwcC9jYW5keWphbS9tYXN0ZXIvYXNzZXRzL3Nwcml0ZXNoZWV0cy9wbGF5ZXIucG5nJyxcclxuXHRcdCdidWxsZXQnIDogJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9jc2hlcHAvY2FuZHlqYW0vbWFzdGVyL2Fzc2V0cy9pbWFnZXMvYnVsbGV0LnBuZydcclxuXHR9XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVJbnN0YW5jZTogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVyVGlsZShwb3M6IFBvaW50LCBjb2xvcjogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2dhbWUuY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQucmVjdChwb3MueCwgcG9zLnksIHRoaXMuX3RpbGUud2lkdGgsIHRoaXMuX3RpbGUuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLl9nYW1lLmNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5fZ2FtZS5jb250ZXh0LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbmRlclRpbGVzKCkgOiB2b2lkIHtcclxuICAgICAgICB2YXIgY29sb3JzID0gW1wiIzc4NWM5OFwiLCBcIiM2OTRmODhcIl07XHJcblxyXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5fZ2FtZS5tYXAud2lkdGg7IHggKz0gdGhpcy5fdGlsZS53aWR0aCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuX2dhbWUubWFwLmhlaWdodDsgeSArPSB0aGlzLl90aWxlLmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHhJbmRleCA9ICh4IC8gdGhpcy5fdGlsZS53aWR0aCkgJSAyO1xyXG4gICAgICAgICAgICAgICAgdmFyIHlJbmRleCA9ICh5IC8gdGhpcy5fdGlsZS5oZWlnaHQpICUgMjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZVBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KHt4LCB5fSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaWxlKHRpbGVQb3MsIGNvbG9yc1t4SW5kZXggXiB5SW5kZXhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbWVyYU9mZnNldChwb3M6IFBvaW50KSA6IFBvaW50IHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7IFxyXG4gICAgICAgICAgICB4OiBwb3MueCAtIHNlbGYuX2dhbWUudmlld3BvcnQucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogcG9zLnkgLSBzZWxmLl9nYW1lLnZpZXdwb3J0LnBvc2l0aW9uLnlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckhlbHBlcihzb3VyY2UgOiBzdHJpbmcsIGNvbGxlY3Rpb24gOiBFbnRpdHlbXSkge1xyXG5cdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0aW1nLnNyYyA9IHNvdXJjZTtcclxuXHJcblx0XHRjb2xsZWN0aW9uLmZvckVhY2goKGUpID0+IHsgXHJcblx0XHRcdHZhciBzcHJpdGUgPSBlLmN1cnJlbnRBbmltYXRpb24uY3VycmVudEZyYW1lLnNwcml0ZTtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMuY2FtZXJhT2Zmc2V0KGUuYm9keS5wb3NpdGlvbik7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fZ2FtZS5jb25maWcuc2hvd0FBQkIpIHtcclxuXHRcdFx0XHR0aGlzLnJlbmRlckFBQkIobmV3IEJvZHkocG9zLCBlLmJvZHkud2lkdGgsIGUuYm9keS5oZWlnaHQpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5fZ2FtZS5jb250ZXh0LmRyYXdJbWFnZShcclxuXHRcdFx0XHRpbWcsIFxyXG5cdFx0XHRcdHNwcml0ZS5vZmZzZXQueCwgc3ByaXRlLm9mZnNldC55LCBcclxuXHRcdFx0XHRzcHJpdGUud2lkdGgsIHNwcml0ZS5oZWlnaHQsIFxyXG5cdFx0XHRcdHBvcy54LCBwb3MueSwgXHJcblx0XHRcdFx0c3ByaXRlLndpZHRoLCBzcHJpdGUuaGVpZ2h0XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlckFBQkIoYm9keTogQm9keSkge1xyXG5cdFx0dmFyIGN0eCA9IHRoaXMuX2dhbWUuY29udGV4dDtcclxuXHRcdFxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LnRyYW5zbGF0ZSgwLjUsIDAuNSk7XHJcblx0XHRjdHgucmVjdChcclxuXHRcdFx0Ym9keS5wb3NpdGlvbi54LCBcclxuXHRcdFx0Ym9keS5wb3NpdGlvbi55LCBcclxuXHRcdFx0Ym9keS53aWR0aCwgXHJcblx0XHRcdGJvZHkuaGVpZ2h0XHJcblx0XHQpO1xyXG5cclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XHJcblx0XHRjdHgubGluZVdpZHRoID0gMTtcclxuXHRcdGN0eC5zdHJva2UoKTtcclxuXHRcdGN0eC50cmFuc2xhdGUoLTAuNSwgLTAuNSk7XHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jbGVhcigpO1xyXG5cclxuXHRcdHRoaXMucmVuZGVyVGlsZXMoKTtcclxuXHRcdHRoaXMucmVuZGVySGVscGVyKHRoaXMuX3Jlc291cmNlc1snYnVsbGV0J10sIHRoaXMuX2dhbWUuYnVsbGV0cyk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ2VuZW15J10sIHRoaXMuX2dhbWUuZW5lbWllcyk7XHJcblx0XHR0aGlzLnJlbmRlckhlbHBlcih0aGlzLl9yZXNvdXJjZXNbJ3BsYXllciddLCBbdGhpcy5fZ2FtZS5wbGF5ZXJdKTtcclxuXHR9XHJcblxyXG5cdGNsZWFyKCkgOiB2b2lkIHtcclxuXHRcdGxldCB3ID0gdGhpcy5fZ2FtZS5jYW52YXMud2lkdGg7XHJcblx0XHRsZXQgaCA9IHRoaXMuX2dhbWUuY2FudmFzLmhlaWdodDtcclxuXHJcblx0XHR0aGlzLl9nYW1lLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG5cdH1cclxufSIsImltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7IFxyXG5cclxuZXhwb3J0IGNsYXNzIFNwcml0ZSB7XHJcblx0b2Zmc2V0IDogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuXHJcblx0d2lkdGggOiBudW1iZXIgPSAwO1xyXG5cdGhlaWdodCA6IG51bWJlciA9IDA7XHJcblxyXG5cdGNvbnN0cnVjdG9yKG9mZnNldDogUG9pbnQsIHdpZHRoIDogbnVtYmVyLCBoZWlnaHQgOiBudW1iZXIpIHtcclxuXHRcdHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBVcGRhdGVyIHtcclxuXHRwcml2YXRlIF9nYW1lIDogR2FtZTtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2FtZUluc3RhbmNlIDogR2FtZSkge1xyXG5cdFx0dGhpcy5fZ2FtZSA9IGdhbWVJbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYWxsRW50aXRpZXMoKSA6IEVudGl0eVtdIHtcclxuXHRcdHJldHVybiA8RW50aXR5W10+IEFycmF5LnByb3RvdHlwZS5jb25jYXQoXHJcblx0XHRcdHRoaXMuX2dhbWUuYnVsbGV0cyxcclxuXHRcdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLFxyXG5cdFx0XHR0aGlzLl9nYW1lLnBsYXllclxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlQW5pbWF0aW9ucygpIDogdm9pZCB7XHJcblx0XHR2YXIgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaCgoZSk9PiB7IGUuY3VycmVudEFuaW1hdGlvbi51cGRhdGUodGhpcy5fZ2FtZS5nYW1lVGltZSk7IH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVFbnRpdGllcygpIDogdm9pZCB7XHJcblx0XHR2YXIgZW50aXRpZXMgPSB0aGlzLmFsbEVudGl0aWVzKCk7XHJcblxyXG5cdFx0ZW50aXRpZXMuZm9yRWFjaChlID0+IHsgZS51cGRhdGUoKTsgfSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHVwZGF0ZURlYWQoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5fZ2FtZS5idWxsZXRzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmJ1bGxldHMpOyB9KVxyXG5cdFx0dGhpcy5fZ2FtZS5lbmVtaWVzLmZvckVhY2goZSA9PiB7IHRoaXMucmVtb3ZlRGVhZChlLCB0aGlzLl9nYW1lLmVuZW1pZXMpOyB9KVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW1vdmVEZWFkKGU6IEVudGl0eSwgY29sbGVjdGlvbjogRW50aXR5W10pIHtcclxuXHRcdGlmIChlLmFsaXZlID09PSBmYWxzZSkge1xyXG5cdFx0XHR2YXIgZUluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGUpO1xyXG5cclxuXHRcdFx0aWYgKGVJbmRleCA+IC0xKSB7XHJcblx0XHRcdFx0Y29sbGVjdGlvbi5zcGxpY2UoZUluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkgOiB2b2lkIHtcclxuXHRcdHRoaXMudXBkYXRlQW5pbWF0aW9ucygpO1xyXG5cdFx0dGhpcy51cGRhdGVFbnRpdGllcygpO1xyXG5cdFx0dGhpcy51cGRhdGVEZWFkKCk7XHJcblx0XHR0aGlzLl9nYW1lLnZpZXdwb3J0LnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5jb2xsaXNpb25zLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5fZ2FtZS5pbnB1dC51cGRhdGUoKTtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4vcG9pbnQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG5cdHN0YXRpYyBjbGFtcCh2YWx1ZSA6IG51bWJlciwgbWluIDogbnVtYmVyLCBtYXggOiBudW1iZXIpIDogbnVtYmVyIHtcclxuXHRcdGlmICh2YWx1ZSA+IG1heCkgeyByZXR1cm4gbWF4OyB9XHJcblx0XHRpZiAodmFsdWUgPCBtaW4pIHsgcmV0dXJuIG1pbjsgfVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBhZGRQb2ludChwb2ludDE6IFBvaW50LCBwb2ludDI6IFBvaW50KSA6IFBvaW50IHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHggOiBwb2ludDEueCArIHBvaW50Mi54LFxyXG5cdFx0XHR5IDogcG9pbnQxLnkgKyBwb2ludDIueVxyXG5cdFx0fVxyXG5cdH1cclxufSIsImltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL21hcCc7XHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi9wb2ludCc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcclxuXHRwdWJsaWMgdGFyZ2V0OiBQb2ludDtcclxuXHRwdWJsaWMgcG9zaXRpb246IFBvaW50ID0geyB4IDogMCwgeSA6IDAgfTtcclxuXHJcblx0cHJpdmF0ZSBfZ2FtZTogR2FtZTtcclxuXHRwcml2YXRlIF93aWR0aDogbnVtYmVyO1xyXG5cdHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihnYW1lSW5zdGFuY2U6IEdhbWUpIHtcclxuXHRcdHRoaXMuX2dhbWUgPSBnYW1lSW5zdGFuY2U7XHJcblx0XHR0aGlzLl93aWR0aCA9IGdhbWVJbnN0YW5jZS5jYW52YXMud2lkdGg7XHJcblx0XHR0aGlzLl9oZWlnaHQgPSBnYW1lSW5zdGFuY2UuY2FudmFzLmhlaWdodDtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgY2FsY3VsYXRlUG9zaXRpb24oKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5wb3NpdGlvbi54ID0gVXRpbC5jbGFtcCh0aGlzLnRhcmdldC54IC0gdGhpcy5fd2lkdGggLyAyLCAwLCB0aGlzLl9nYW1lLm1hcC53aWR0aCAtIHRoaXMuX3dpZHRoKTtcclxuXHRcdHRoaXMucG9zaXRpb24ueSA9IFV0aWwuY2xhbXAodGhpcy50YXJnZXQueSAtIHRoaXMuX2hlaWdodCAvIDIsIDAsIHRoaXMuX2dhbWUubWFwLmhlaWdodCAtIHRoaXMuX2hlaWdodCk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSA6IHZvaWQge1xyXG5cdFx0dGhpcy5jYWxjdWxhdGVQb3NpdGlvbigpO1xyXG5cdH1cclxufSJdfQ==
