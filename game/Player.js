function exportPlayer (exports) {

    var Player = function () {
        this.gold = 100;
        this.lives = 20;
        this.socket = io.connect("http://localhost:8080");
        this.lastSync = null;
        this.requestNum = 0;
        this.syncRequest = {};
    }

    //Bypass circular dependency
    Player.prototype.attachGrid = function (grid) {
        this.grid = grid;
        grid.player = grid;
    }

    Player.prototype.sync = function() {
        var prevGrid = this.grid.clone();
        this.syncRequest[this.requestNum] = prevGrid;
        this.lastSync = (new Date).getTime();
        this.socket.emit('sync', {
            requestNum: this.requestNum,
            time: lastSync
        });
        this.requestNum++;
    }

    Player.prototype.onSynced = function (data) {
        var prevGrid = syncRequest[data.requestNum],
            verified = prevGrid.equals(data.grid);

        if (!verified) {
            this.grid = data.grid;
        }
    }
}
