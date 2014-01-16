(function exportGrid (exports) {

    if (!Utility) Utility = require('./Utility.js');

    if(!_) _ = require('underscore')._;

    var GridObj = function (x, y, grid) {
        this.x = x || 0;
        this.y = y || 0;
        this.grid = grid;
    }

    GridObj.prototype.equals = function (other) {
        return (
            Utility.floatsEqual(this.y, other.y, .001) &&
            Utility.floatsEqual(this.x, other.x, .001)
        );
    }

    GridObj.prototype.clone = function () {
        return _.clone(this);
    }

    var Square = function (x, y, grid) {
        GridObj.call(x, y, grid);    
        this.canWalk = true;
        this.canBuild = true;
        this.item = null;
        this.texture = 'green';
        this.node = null;
    };

    Square.prototype = new GridObj();

    exports.GridObj = GridObj;
    exports.Square = Square;

    var Grid = function () {
        this.rows = 10;
        this.cols = 20;
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
            this.grid[i] = new Array(this.cols);
        }

        for(y = 0; y < this.rows; y++) {
            for(x = 0; x < this.cols; x++) {
                this.grid[y][x] = new Square(x, y);
            }
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

    Grid.prototype.sendCreep = function (Creep) {
        var creep = new Creep(this.startX, this.startY, this);
        this.creeps.push(creep);
    };

    Grid.prototype.update = function (delta) { 
        var i = 0;
        for (i = 0; i < this.projectiles.length; i++) {
            projectiles[i].move(delta);
        }

        for (i = 0; i < this.towers.length; i++) {
            towers[i].attack(delta);
        }

        for (i = 0; i < this.creeps.length; i++) {
            creeps[i].move(delta);
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

    exports.Grid = Grid;
}) (typeof exports === 'undefined' ? this['Grid'] = {} : exports);


