(function exportCreep (exports) {

    var GridObj = Grid ? Grid.GridObj : require('./Grid.js').GridObj;
    if (!GridObj) throw Error('GridObj not found');

    function Creep(xPos, yPos, grid) { 
        GridObj.call(this, xPos, yPos, grid);
        this.currSquare = null;
        this.nextSquare = null;
        this.damage = 1;
        this.hp = 5;
        this.gold = 10;
        this.speed = 300;
    };

    Creep.prototype = new GridObj();

    Creep.prototype.equals = function (other) {
        return (
            GridObj.equals.call(this, other) &&
            this.damage === other.damage &&
            this.hp === other.hp &&
            this.gold === other.gold &&
            this.speed === other.speed
        )
    }

    Creep.prototype.reachedEnd = function() {
        if (this.xPos === this.grid.endX && this.yPos === this.grid.endY) {
            this.grid.player.lives--;
            if (this.grid.player.lives <= 0) {
                this.grid.player.dies();
            }
        }
    };

    Creep.prototype.move = function(interval, speed) { 
        speed = speed || this.speed;
        if (this.movelist === '') { 
            this.reachedEnd();
            removeFromArr(this.grid.creeps, this);
            return true;
        }

        var move = this.movelist.charAt(0);
        if (this.nextSquare === null) {
            if (this.currSquare !== null) {
                this.movelist = this.grid.findShortestPath(Math.floor(this.xPos), Math.floor(this.yPos), this.grid.endX, this.grid.endY).moves;
                move = this.movelist.charAt(0);
            }

            this.currSquare = {x: this.xPos, y: this.yPos};
            this.grid.grid[this.yPos][this.xPos].canBuild = false;

            //OPTIMIZATION Change r,l,d,u to an enum. Makes math/life easier. Beware of concatenation.
            if (move === 'r') {
                this.nextSquare = {x: this.xPos + 1, y: this.yPos, dir: 'r'}
            } else if (move === 'l') {
                this.nextSquare = {x: this.xPos - 1, y: this.yPos, dir: 'l'}
            } else if (move === 'd') {
                this.nextSquare = {x: this.xPos, y: this.yPos + 1, dir: 'd'}
            } else if (move === 'u') {
                this.nextSquare = {x: this.xPos, y: this.yPos - 1, dir: 'u'}
            }
        }

        if (move === 'r') {
            this.xPos += interval / speed;
        } else if (move === 'l') {
            this.xPos -= interval / speed;
        } else if (move === 'd') {
            this.yPos += interval / speed;
        } else if (move === 'u') {
            this.yPos -= interval / speed;
        }

        if (this.nextSquare) {
            var dir = this.nextSquare.dir,
                onNextSquare = false,
                difference;

            if (dir === 'r' && this.xPos >= this.nextSquare.x) { 
                difference = this.xPos - this.nextSquare.x;
                this.xPos = this.nextSquare.x;
                onNextSquare = true;
            } else if (dir === 'l' && this.xPos  <= this.nextSquare.x) {
                difference = this.nextSquare.x - this.xPos;
                this.xPos = this.nextSquare.x;
                onNextSquare = true;
            } else if (dir === 'd' && this.yPos  >= this.nextSquare.y) {
                difference = this.yPos - this.nextSquare.y;
                this.yPos = this.nextSquare.y;
                onNextSquare = true;
            } else if (dir === 'u' && this.yPos  <= this.nextSquare.y) {
                difference = this.nextSquare.y - this.yPos;
                this.yPos = this.nextSquare.y;
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
        var offset = BLOCKSIZE / 2;
        ctx.arc(this.xPos*BLOCKSIZE + offset, this.yPos*BLOCKSIZE + offset, 5, 0, 2*Math.PI, false);
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
            removeFromArr(this.grid.creeps, this);
            this.grid.grid[this.currSquare.y][this.currSquare.x].canBuild = true;
            this.grid.player.gold += this.gold;
        }
    };

    exports.Creep = Creep;
}) (typeof exports === 'undefined' ? this['Creep'] = {} : exports);
