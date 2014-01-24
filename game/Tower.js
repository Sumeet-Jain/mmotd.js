var GridObj = require('./GridObj'),
    Projectile = require('./Projectile'),
    Utility = require('./Utility');

function Tower(x, y, grid) {
    GridObj.call(this, x, y, grid);
    this.name = 'Basic';
    this.range = 4;
    this.currCooldown = 0;
    this.cooldown = 5000;
    this.background = "blue";
    this.cost = 40;
};

Tower.prototype = new GridObj();

Tower.prototype.equals = function (other) {
    return (
        GridObj.prototype.equals.call(this, other) &&
        this.name === other.name &&
        this.range === other.range &&
        Utility.floatsEqual(this.currCooldown, other.currCooldown, .001) &&
        this.currCooldown === other.currCooldown && 
        this.cost === other.cost
    )
}

Tower.prototype.attack = function(interval) {
    var shortestD = Number.MAX_VALUE,
        nearestCreep = null;
    this.currCooldown -= interval;

    if (this.currCooldown <= 0) {
        for (var i = 0; i < this.grid.creeps.length; i++) {
            var creep = this.grid.creeps[i],
                distance = Math.pow(creep.x - this.x, 2) + Math.pow(creep.y - this.y, 2);
            if (distance < this.range * this.range && distance < shortestD) {
                nearestCreep = creep;
                shortestD = distance
            }
        }

        if (nearestCreep) {
            var projectile = new Projectile(this.x, this.y, this.grid, nearestCreep);
            projectile.fire();
            this.currCooldown = this.cooldown;
        }
    }
};

module.exports = Tower;
