(function exportTower (exports) {
    var GridObj = Grid ? Grid.GridObj : require('./Grid.js').GridObj;

    if (!GridObj) throw Error("Gridobj not found");

    function Tower(x, y, grid) {
        GridObj.call(this, x, y, grid);
        this.name = 'Basic';
        this.range = 4;
        this.currCooldown = 0;
        this.cooldown = 500;
        this.background = "blue";
        this.cost = 40;
    };

    Tower.prototype = new GridObj();

    Tower.prototype.equals = function (other) {
        return (
            GridObj.equals.call(this, other) &&
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
                    distance = Math.pow(creep.xPos - this.xPos, 2) + Math.pow(creep.yPos - this.yPos, 2);
                if (distance < this.range * this.range && distance < shortestD) {
                    nearestCreep = creep;
                    shortestD = distance
                }
            }

            if (nearestCreep) {
                var projectile = new Projectile(this.xPos, this.yPos, this.grid, nearestCreep);
                projectile.fire();
                this.currCooldown = this.cooldown;
            }
        }
    };

    exports.Tower = Tower;
}) (typeof exports === 'undefined' ? this['Tower'] = {} : exports);
