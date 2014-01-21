var connect = require('connect'),
    io = require('socket.io'),
    Grid = require('./game/Grid.js').Grid,
    Player = require('./game/Player.js').Player,
    clients = {},
    actionQueue = [],
    currentID = 0,
    server = connect().use(connect.static(__dirname)).listen(8080);

io = io.listen(server, {log: false});

io.sockets.on('connection', function onConnect (socket) {
    var player = new Player();
    var grid = new Grid();
    player.attachGrid(grid);

    socket.set('id', currentID, function () { 
        clients[currentID] = player;
        clients[currentID].socket = socket;
        currentID++
        console.log(currentID);
    });

    socket.on('sync', function (data) {
        socket.get('id', function (err, id) {
            processActionQueue();
            console.log('Syncing ' + id);
            var player = clients[id],
                grid = player.grid,
                result = {
                    player: player,
                    grid: grid,
                    requestNum: data.requestNum
                };

            player.grid = null;
            grid.player = null;
            player.canUpdate = false;
            grid.removeCircularity();

            socket.emit('synced', result);

            player.grid = grid;
            grid.player = player;
            grid.restoreCircularity();
        });
    });

    socket.on('buildTower', function (request) {
        socket.get('id', function (err, id) {
            request.playerId = id;
            request.action = 'build';
            actionQueue.push(request);
        });
    });

    socket.on('sendCreep', function (request) {
        socket.get('id', function (err, id) {
            request.playerId = id;
            request.action = 'send';
            actionQueue.push(request);
        })
    }); 
    socket.on('disconnect', function (data) {
        socket.get('id', function (err, id) {
            clients[id].timeoutId = setTimeout(function () {
                delete clients[id];
            }, 5 * 60 * 1000);
        });
    });

    socket.on('reconnect', function (data) {
        socket.get('id', function (err, id) {
            clearTimeout(clients[id].timeoutId);
            return clients[id];
        });
    });

});

function processActionQueue (limit) {
    var limit = limit || Number.MAX_VALUE,
        action,
        player;
        

    actionQueue.sort(function (a, b) {
        return a.timeStamp > b.timeStamp
    });

    while (actionQueue.length &&  actionQueue[0].timeStamp < limit) {
        action = actionQueue.shift();
        console.log("performing action: " + action);
        player = clients[action.playerId];

        player.update(action.timeStamp);

        if (action.action == 'build') {
            player.grid.buildTower();
        } else if (action.action == 'send') { 
            for (playerId in clients) {
                if (playerId != action.playerId) { 
                    clients[playerId].sentCreep();
                    clients[playerId].socket.emit('sentCreep');
                }
            }
        }
    }

};

function updateServer() {
    processActionQueue();
    var currTime = Date.now();
    for (playerId in clients) {
        clients[playerId].update(currTime);
    }
};


setInterval(updateServer, 200);
