var Utility = require('./Utility')

var GridObj = function (x, y, grid) {
    this.x = x || 0;
    this.y = y || 0;
    this.grid = grid;
}

GridObj.prototype.equals = function (other) {
    return (
        Utility.floatsEqual(this.y, other.y, .01) &&
        Utility.floatsEqual(this.x, other.x, .01)
    );
}

GridObj.prototype.clone = function () {
    return _.clone(this);
}

GridObj.prototype.replace = function (other) {
    for (prop in other) {
        this[prop] = other[prop];
    }
}

module.exports = GridObj;
