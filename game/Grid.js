var Utility = require('./Utility'),
    _ = require('underscore'),
    Square = require('./Square'),
    Tower = require('./Tower'),
    Creep = require('./Creep'),
    Projectile = require('./Projectile');


var Grid = function () {
    this.rows = 10;
    this.cols = 25;
    this.sqSize = 40;
    this.creeps = [];
    this.towers = [];
    this.projectiles = [];
    this.grid = new Array(this.rows);

    this.startX = 0;
    this.endX = this.cols - 1;
    this.startY = this.rows / 2;
    this.endY = this.rows / 2;

    for(var i = 0; i < this.grid.length; i++) {
        this.grid[i] = new Array(this.rows);
    }

    for(y = 0; y < this.rows; y++) {
        for(x = 0; x < this.cols; x++) {
            this.grid[y][x] = new Square(x, y);
        }
    }
}

Grid.prototype.replace = function (other) {
    var i, j;

    this.creeps = [];
    this.towers = [];
    this.projectiles = [];

    for (i = 0; i < other.grid.length; i++) {
        for (j = 0; j < other.grid[0].length; j++) {
            this.grid[i][j].replace(other.grid[i][j]);
        }
    }

    for (i = 0; i < other.creeps.length; i++) {
        var c = new Creep();
        c.replace(other.creeps[i]);
        this.creeps.push(c);
    }

    for (i = 0; i < other.towers.length; i++) {
        var t = new Tower();
        t.replace(other.towers[i]);
        this.towers.push(t);
    } 

    /* Testing to see if i can fake projectiles on client side
    for (i = 0; i < other.projectiles.length; i++) {
        var p = new Projectile();
        p.replace(other.projectiles[i]);
        p.creep.__proto__ = Creep.prototype;
        this.projectiles.push(p);
    }
    */
}

Grid.prototype.removeCircularity = function () {
    var i;

    for (i = 0; i < this.creeps.length; i++) {
        this.creeps[i].grid = null;
    }
    
    for (i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].grid = null;
        this.projectiles[i].creep.grid = null;
    }

    for (i = 0; i < this.towers.length; i++) {
        this.towers[i].grid = null;
    }
}

Grid.prototype.restoreCircularity = function () {
    var i;

    for (i = 0; i < this.creeps.length; i++) {
        this.creeps[i].grid = this;
    }
    
    for (i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].grid = this;
        this.projectiles[i].creep.grid = this;
    }

    for (i = 0; i < this.towers.length; i++) {
        this.towers[i].grid = this;
    }
}

Grid.prototype.createBackground = function () {
    var x = 0,
        y = 0,
        board = document.getElementById('board'),
        canvas = document.getElementById('moving-objs'),
        ctx = canvas.getContext('2d'),
        BLOCKSIZE = this.sqSize,
        squareNode,
        sq,
        i;

    board.style.width = BLOCKSIZE * (this.cols) + "px";
    board.style.height = BLOCKSIZE * (this.rows) + "px";

    //MAYBE CHANGE DRAWING THE BACKGROUND TO A CANVAS. IDK
    canvas.width = BLOCKSIZE * this.cols;
    canvas.height = BLOCKSIZE * this.rows;

    for(y = 0; y < this.rows; y++) {
        for(x = 0; x < this.cols; x++) {
            squareNode = document.createElement('div');
            squareNode.id = "sq" + x + "-" + y;
            squareNode.className += "square ";
            squareNode.style.width = BLOCKSIZE + 'px';
            squareNode.style.height = BLOCKSIZE + 'px';
            board.appendChild(squareNode);
            this.grid[y][x].node = squareNode;
        }
    }

    sq = this.grid[Math.floor(this.rows/2)][0];
    sq.node.style.background = "rgb(100,100,0)";
    sq.canBuild = false;

    sq = this.grid[this.endY][this.endX];
    sq.node.style.background = "rgb(100,100,0)";
    sq.canBuild = false;
};

Grid.prototype.inGrid = function (x, y) {
    var xInBounds = x >= 0 && x < this.cols,
        yInBounds = y >= 0 && y < this.rows;
    return xInBounds && yInBounds;
};

Grid.prototype.updateBackground = function () {
    var i, j, color;
    for (i = 0; i < this.grid.length; i++) {
        for (j = 0; i < this.grid[0].length; j++) {
            color = this.grid[i][j].node.style.color;
            if (color != this.grid[i][j].texture) {
                this.grid[i][j].node.style.backgroundColor = color;
            }
        }
    }
}

Grid.prototype.update = function (delta) { 
    var i = 0;
    for (i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].move(delta);
    }

    for (i = 0; i < this.towers.length; i++) {
        this.towers[i].attack(delta);
    }

    for (i = 0; i < this.creeps.length; i++) {
        this.creeps[i].move(delta);
    }
};

Grid.prototype.clone = function () {
    var clone = new Grid(), 
        i, 
        j;

    for (i = 0; i < this.creeps.length; i++) {
        clone.creeps.push(this.creeps[i].clone());
    }

    for (i = 0; i < this.towers.length; i++) {
        clone.towers.push(this.towers[i].clone());
    }

    for (i = 0; i < this.projectiles.length; i++) {
        clone.projectiles.push(this.projectiles[i].clone());
    };

    for (i = 0; i < this.grid.length; i++) {
        for (j = 0; j < this.grid[0].length; j++) {
            clone.grid[i][j] = this.grid[i][j].clone();
        }
    }

    return clone;
};

Grid.prototype.equals = function (other) {
    var i;
    if (other === undefined || other.towers === undefined ||
            other.creeps === undefined || other.projectiles === undefined) {
                return false;
            }

    if (other.towers.length !== this.towers.length ||
            other.creeps.length !== this.creeps.length ||
            other.projectiles.length !== this.projectiles.length
       )  return false;

    for (i = 0; i < this.towers.length; i++) {
        if (! this.towers[i].equals(other.towers[i])) {
            console.log("towers");
            return false;
        }
    }

    for (i = 0; i < this.creeps.length; i++) {
        if (! this.creeps[i].equals(other.creeps[i])) {
            console.log("creeps");
            return false;
        }
    }  

    for (i = 0; i < this.projectiles.length; i++) {
        if (! this.projectiles[i].equals(other.projectiles[i])) {
            console.log("proj");
            return false;
        }
    }

    return true
};

Grid.prototype.findShortestPath = function(startX, startY, endX, endY) {;
    var visited = new Array(this.rows),
        queue = [],
        x = 0,
        y = 0,
        nextEle;

    for(y = 0; y < visited.length; y++) { 
        visited[y] = new Array(this.cols);
    }

    function enqueue(queObj, gridRef) {
        //gridRef is the grid which the parent function is in. Cant use keyword this
        //Only looks at left, right, up, and down of current square
        var x = queObj.x,
            y = queObj.y,
            previous = queObj.moves;

        if (x === endX && y === endY) 
            return {x: x, y: y, moves: previous || ''};

        x++;
        previous = previous || '';
        if (gridRef.inGrid(x, y) && !visited[y][x] && gridRef.grid[y][x].canWalk) {
            queue.push({x: x, y: y, moves: previous + 'r'});
            visited[y][x] = true;
        }

        x -= 2;
        if (gridRef.inGrid(x, y) && !visited[y][x] && gridRef.grid[y][x].canWalk) {
            queue.push({x: x, y: y, moves: previous + 'l'});
            visited[y][x] = true;
        }

        x++;
        y++;
        if (gridRef.inGrid(x, y) && !visited[y][x] && gridRef.grid[y][x].canWalk) {
            queue.push({x: x, y: y, moves: previous + 'd'});
            visited[y][x] = true;
        }

        y -= 2;
        if (gridRef.inGrid(x, y) && !visited[y][x] && gridRef.grid[y][x].canWalk) {
            queue.push({x: x, y: y, moves: previous + 'u'});
            visited[y][x] = true;
        }
    };

    nextEle = enqueue({x: startX, y: startY}, this);
    if (nextEle)
        return nextEle;

    while (queue.length) {
        nextEle = enqueue(queue.shift(), this);
        if (nextEle) {
            return nextEle;
        }
    }
};

Grid.prototype.buildTower = function(Tower, x, y) {

    if (this.player.socket) {
        this.player.onBuildTower({
            x: x,
            y: y,
        })
    };

    if (this.inGrid(x,y)) {
        var square = this.grid[y][x],
            i = 0,
              tower = new Tower(x, y, this),
              creep,
              tower,
              content;

        square.canWalk = false;

        if (
                square.canBuild &&
                this.player.gold > tower.cost &&
                this.findShortestPath(this.startX, this.startY, this.endX, this.endY)) {
                    square.canBuild = false;

                    if (square.node) {
                        square.node.style.background = tower.background;
                        $(square.node).popover({
                            trigger: 'hover',
                            html: 'true',
                            delay: 0,
                            content: function () {
                                content = [
                                    '<div> ',
                                    tower.name + ' <br> ',
                                    'Cooldown: ' + tower.cooldown + ' <br> ',
                                    'Range: ' + tower.range + ' <br> ',
                                    '</div>'
                                ]
                                return content.join(' ');
                            },
                            placement: "auto top",
                        });
                    };

                    this.towers.push(tower);

                    for (i = 0; i < this.creeps.length; i++) {
                        creep = this.creeps[i];
                        if (creep.nextSquare && creep.nextSquare.x === x && creep.nextSquare.y === y) { 
                            var dir = creep.nextSquare.dir,
                                reverse;
                            if (dir === 'r') reverse = 'l';
                            else if (dir === 'l') reverse = 'r';
                            else if (dir === 'u') reverse = 'd';
                            else if (dir === 'd') reverse = 'u';
                            creep.nextSquare = {x: creep.currSquare.x, y: creep.currSquare.y, dir: reverse};
                            creep.movelist = reverse + creep.movelist;
                        }
                    }

                    this.player.gold -= tower.cost;
                    return true;
                }
        
        square.canWalk = true
    }
    return false;
};

module.exports = Grid;
