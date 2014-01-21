(function exportPlayer (exports) {

    var HOST = '192.168.2.7:8080'
    Creep = (typeof Creep === 'undefined') ? require('./Creep').Creep : Creep.Creep;

    var Player = function () {
        this.gold = 100;
        this.lives = 20;
        this.lastSync = null;
        this.requestNum = 0;
        this.syncRequest = {};
        this.lastUpdated = null;
    } 

    Player.prototype.toJSON = function () {
        return {
            gold: this.gold,
            lives: this.lives
        }
    };

    //Bypass circular dependency of grid and player
    //Should probs change later to the require thing
    Player.prototype.attachGrid = function (grid) {
        this.grid = grid;
        grid.player = grid;
    };

    Player.prototype.equals = function (other) {
        return (
            this.gold === other.gold &&
            this.lives === other.lives
        ) 
    }

    Player.prototype.connect = function () {
        this.socket = io.connect(HOST);
        this.socket.on('synced', this.onSynced.bind(this));
        this.socket.on('onConnected', this.onConnected.bind(this));
        this.socket.on('sentCreep', this.sentCreep.bind(this));
    };

    Player.prototype.onConnected = function (data) {
        console.log("hurray!")
    };

    Player.prototype.sync = function() {
        var prevGrid = this.grid.clone();
        this.syncRequest[this.requestNum] = prevGrid;
        this.lastSync = Date.now();
        this.socket.emit('sync', {
            requestNum: this.requestNum,
            timeStamp: this.lastSync
        });
        this.requestNum++;
    };

    Player.prototype.onSynced = function (data) {
        var prevGrid = this.syncRequest[data.requestNum],
            verified = prevGrid.equals(data.grid) && this.equals(data.player);

        if (!verified) {
            console.log('Reassigning shit');
            this.grid.replace(data.grid);
            this.grid.restoreCircularity();
            this.grid.player = this;
            this.lives = data.player.lives;
            this.gold = data.player.gold;
        }
    };

    Player.prototype.onTowerBuild = function (info) {
        info.timeStamp = Date.now();
        this.socket.emit('buildTower', info);
        this.sync();
    };

    Player.prototype.leaked = function () {
        this.lives--;
        if (this.lives <= 0) {
            //TODO
        }
    };

    Player.prototype.sendCreep = function () {
        //var creep = new Creep(this.grid.startX, this.grid.startY, this.grid);
        //this.grid.creeps.push(creep);

        if (this.socket !== undefined) {
            this.socket.emit('sendCreep', {
                timeStamp: Date.now()
            });
        }
    };

    Player.prototype.sentCreep = function () {
        var creep = new Creep(this.grid.startX, this.grid.startY, this.grid);
        console.log('sent creep');
        this.grid.creeps.push(creep);
    }


    Player.prototype.killedCreep = function (gold) {
        this.gold += gold;
    };

    Player.prototype.update = function (timestamp) {
        if (this.lastUpdated === null) {
            this.lastUpdated = timestamp;
        } else {
            var interval = timestamp - this.lastUpdated;
            this.grid.update(interval);
            this.lastUpdated = timestamp;
        }
    };

    exports.Player = Player;

}) (typeof exports === 'undefined' ? this['Player'] = {} : exports);
