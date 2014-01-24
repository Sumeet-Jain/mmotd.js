var HOST = '192.168.2.7:8080',
    Creep = require('./Creep');

var Player = function () {
    this.gold = 10000;
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
    grid.player = this;
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
    this.socket.on('ping', this.pong.bind(this));
};

Player.prototype.pong = function (data) {
    data.clientTime = Date.now();
    this.socket.emit('pong', data);
};


Player.prototype.onConnected = function (data) {
};

Player.prototype.sync = function() {
    //var prevGrid = this.grid.clone();
    //this.syncRequest[this.requestNum] = prevGrid;
    this.lastSync = Date.now();
    this.socket.emit('sync', {
        requestNum: this.requestNum,
        timestamp: this.lastSync
    });
    this.requestNum++;
};

Player.prototype.onSynced = function (data) {
    /*
    var prevGrid = this.syncRequest[data.requestNum],
        verified = prevGrid.equals(data.grid) && this.equals(data.player);
        */
        this.grid.replace(data.grid);
        this.grid.restoreCircularity();
        this.grid.player = this;
        this.lives = data.player.lives;
        this.gold = data.player.gold;
};

Player.prototype.onBuildTower = function (info) {
    info.timestamp = Date.now();
    this.socket.emit('buildTower', info);
};

Player.prototype.leaked = function () {
    this.lives--;
    if (this.lives <= 0) {
        //TODO
    }
};

Player.prototype.sendCreep = function () {
    this.socket.emit('sendCreep', {
        timestamp: Date.now()
    });
};

Player.prototype.sentCreep = function () {
    var creep = new Creep(this.grid.startX, this.grid.startY, this.grid);
    this.grid.creeps.push(creep);
}

Player.prototype.sendCreepToSelf = function () {
    var creep = new Creep(this.grid.startX, this.grid.startY, this.grid);
    this.grid.creeps.push(creep);

    if (this.socket) {
        this.socket.emit('sendCreepToSelf', {
            timestamp: Date.now()
        });
    }
}

Player.prototype.killedCreep = function (gold) {
    this.gold += gold;
};

Player.prototype.update = function (timestamp) {
    if (this.lastUpdated === null) {
        this.lastUpdated = timestamp;
    } else {
        this.grid.update(timestamp - this.lastUpdated);
        this.lastUpdated = timestamp;
    }
};

module.exports = Player;
