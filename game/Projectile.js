(function (exports) {

    var GridObj = Grid ? Grid.GridObj : require('./Grid.js').GridObj;
    if (!GridObj) throw Error('GridObj not found');

    function Projectile(x, y, grid, creep) {
        GridObj.call(this, x, y, grid);
        this.creep = creep;
        this.damage = 1;
        this.speed = 100;
    }

    Projectile.prototype = new GridObj();

    Projectile.prototype.clone = function () {
        var clone =  GridObj.clone.call(this);
        clone.creep = this.creep.clone();
        return clone;
    };

    Projectile.prototype.equals = function (other) {
        var delta = .001;
        return (
            GridObj.equals.call(this, other) &&
            this.damage === other.damage &&
            this.speed === other.speed &&
            this.creep.equals(other.creep)
        )
    }

    Projectile.prototype.fire = function() { 
        this.grid.projectiles.push(this);
    }

    Projectile.prototype.move = function(interval) {
        var destX = this.creep.xPos,
            destY = this.creep.yPos,
            xDist = destX - this.xPos,
            yDist = destY - this.yPos,
            totalDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)),
            delta = BLOCKSIZE / 500;
        if (this.creep.hp > 0) { 
            this.xPos += (xDist / totalDist) * interval / this.speed;
            this.yPos += (yDist / totalDist) * interval / this.speed;
        } 

        //If hit
        if (Math.abs(this.xPos - destX) < delta && Math.abs(this.yPos - destY) < delta || this.creep.hp <= 0) {
            this.creep.getHit(this.damage);
            removeFromArr(this.grid.projectiles, this);
            return true;
        }
    }

    Projectile.prototype.draw = function(canvas, ctx) { 
        ctx.fillStyle = "white";
        ctx.beginPath();
        var offset = BLOCKSIZE/2
        ctx.arc(this.xPos*BLOCKSIZE + offset,  this.yPos*BLOCKSIZE + offset, 2, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }

    exports.Projectile = Projectile;
})(typeof exports === 'undefined' ? this['Projectile'] = {} : exports);
