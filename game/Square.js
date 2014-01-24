var GridObj = require('./GridObj');

var Square = function (x, y, grid) {
    GridObj.call(x, y, grid);    
    this.canWalk = true;
    this.canBuild = true;
    this.item = null;
    this.texture = 'purple';
    this.node = null;
};

Square.prototype = new GridObj();

Square.prototype.replace = function (other) {
    this.canWalk = other.canWalk;
    this.canBuild = other.canBuild;
    this.item = other.item;
    this.texture = other.texture;
}

module.exports = Square;
