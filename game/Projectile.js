var GridObj = require('./GridObj'),
    Utility = require('./Utility');

function Projectile(x, y, grid, creep) {
    GridObj.call(this, x, y, grid);
    this.creep = creep;
    this.damage = 1;
    this.speed = 100;
}

Projectile.prototype = new GridObj();

Projectile.prototype.clone = function () {
    var clone =  GridObj.prototype.clone.call(this);
    clone.creep = this.creep.clone();
    return clone;
};

Projectile.prototype.equals = function (other) {
    var delta = .001;
    return (
        GridObj.prototype.equals.call(this, other) &&
        this.damage === other.damage &&
        this.speed === other.speed &&
        this.creep.equals(other.creep)
    )
}

Projectile.prototype.fire = function() { 
    this.grid.projectiles.push(this);
}

Projectile.prototype.move = function(interval) {
    var destX = this.creep.x,
        destY = this.creep.y,
        xDist = destX - this.x,
        yDist = destY - this.y,
        totalDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)),
        delta = .1;

    if (this.creep.hp > 0) { 
        this.x += (xDist / totalDist) * interval / this.speed;
        this.y += (yDist / totalDist) * interval / this.speed;
    } 

    //If hit
    if (Utility.floatsEqual(this.x, destX, delta) && Utility.floatsEqual(this.y, destY, delta) || this.creep.hp <= 0) {
        this.creep.getHit(this.damage);
        Utility.removeFromArr(this.grid.projectiles, this);
        return true;
    }
}

Projectile.prototype.draw = function(canvas, ctx) { 
    ctx.fillStyle = "white";
    ctx.beginPath();
    var offset = this.grid.sqSize/2
    ctx.arc(this.x*this.grid.sqSize + offset,  this.y*this.grid.sqSize + offset, 2, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.closePath();
}

module.exports = Projectile;
