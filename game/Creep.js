(function exportCreep (exports) {

    var GridObj = (typeof Grid !== 'undefined') ? Grid.GridObj : require('./Grid.js').GridObj;

    if (!GridObj) throw Error('GridObj not found');
    
    if (typeof Utility === 'undefined') Utility = require('./Utility');

    function Creep(x, y, grid) { 
        GridObj.call(this, x, y, grid);
        this.currSquare = null;
        this.nextSquare = null;
        this.damage = 1;
        this.hp = 5;
        this.gold = 10;
        this.speed = 1000;
        this.movelist = this.grid.findShortestPath(this.x, this.y, this.grid.endX, this.grid.endY).moves;
    };

    Creep.prototype = new GridObj();

    Creep.prototype.equals = function (other) {
        return (
            GridObj.prototype.equals.call(this, other) &&
            this.damage === other.damage &&
            this.hp === other.hp &&
            this.gold === other.gold &&
            this.speed === other.speed
        )
    }

    Creep.prototype.reachedEnd = function() {
        if (this.x === this.grid.endX && this.y === this.grid.endY) {
            this.grid.player.leaked();
        };
    };

    Creep.prototype.move = function(interval, speed) { 
        speed = speed || this.speed;
        if (this.movelist === '') { 
            this.reachedEnd();
            Utility.removeFromArr(this.grid.creeps, this);
            return true;
        }

        var move = this.movelist.charAt(0);
        if (this.nextSquare === null) {
            if (this.currSquare !== null) {
                this.movelist = this.grid.findShortestPath(Math.floor(this.x), Math.floor(this.y), this.grid.endX, this.grid.endY).moves;
                move = this.movelist.charAt(0);
            }

            this.currSquare = {x: this.x, y: this.y};
            this.grid.grid[this.y][this.x].canBuild = false;

            //OPTIMIZATION Change r,l,d,u to an enum. Makes math/life easier. Beware of concatenation.
            if (move === 'r') {
                this.nextSquare = {x: this.x + 1, y: this.y, dir: 'r'}
            } else if (move === 'l') {
                this.nextSquare = {x: this.x - 1, y: this.y, dir: 'l'}
            } else if (move === 'd') {
                this.nextSquare = {x: this.x, y: this.y + 1, dir: 'd'}
            } else if (move === 'u') {
                this.nextSquare = {x: this.x, y: this.y - 1, dir: 'u'}
            }
        }

        if (move === 'r') {
            this.x += interval / speed;
        } else if (move === 'l') {
            this.x -= interval / speed;
        } else if (move === 'd') {
            this.y += interval / speed;
        } else if (move === 'u') {
            this.y -= interval / speed;
        }

        if (this.nextSquare) {
            var dir = this.nextSquare.dir,
                onNextSquare = false,
                difference;

            if (dir === 'r' && this.x >= this.nextSquare.x) { 
                difference = this.x - this.nextSquare.x;
                this.x = this.nextSquare.x;
                onNextSquare = true;
            } else if (dir === 'l' && this.x  <= this.nextSquare.x) {
                difference = this.nextSquare.x - this.x;
                this.x = this.nextSquare.x;
                onNextSquare = true;
            } else if (dir === 'd' && this.y  >= this.nextSquare.y) {
                difference = this.y - this.nextSquare.y;
                this.y = this.nextSquare.y;
                onNextSquare = true;
            } else if (dir === 'u' && this.y  <= this.nextSquare.y) {
                difference = this.nextSquare.y - this.y;
                this.y = this.nextSquare.y;
                onNextSquare = true;
            }

            if (onNextSquare) {
                this.nextSquare = null;
                this.grid.grid[this.currSquare.y][this.currSquare.x].canBuild = true;
                return this.move(difference  * speed, speed);
            } else {
                this.grid.grid[this.currSquare.y][this.currSquare.x].canBuild = false
            }
        }

        return false;
    };

    Creep.prototype.draw = function (canvas, ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        var offset = this.grid.sqSize / 2;
        ctx.arc(this.x * this.grid.sqSize + offset, this.y * this.grid.sqSize + offset, 5, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.closePath();
    };

    Creep.prototype.getHit = function (damage) {
        if (this.hp > 0) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.die();
            }
        }
    };

    Creep.prototype.die = function () {
        if (this.hp <= 0) {
            Utility.removeFromArr(this.grid.creeps, this);;
            this.grid.grid[this.currSquare.y][this.currSquare.x].canBuild = true;
            this.grid.player.killedCreep(this.gold);
        };
    };

    exports.Creep = Creep;
}) (typeof exports === 'undefined' ? this['Creep'] = {} : exports);
