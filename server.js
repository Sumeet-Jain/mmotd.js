var connect = require('connect'),
    io = require('socket.io'),
    Grid = require('./game/Grid.js'),
    Player = require('./game/Player.js'),
    Tower = require('./game/Tower.js'),
    clients = {},
    actionQueue = [],
    currentID = 0,
    server = connect().use(connect.static(__dirname)).listen(8080),
    timeoutID = setTimeout(updateServer, 200);

io = io.listen(server, {log: false});

io.sockets.on('connection', function onConnect (socket) {
    var player = new Player();
    var grid = new Grid();
    player.attachGrid(grid);

    socket.set('id', currentID, function () { 
        player.startTime = Date.now();
        clients[currentID] = player;
        clients[currentID].serverSocket = socket;
        currentID++
        socket.emit('ping', {timestamp: Date.now()});
    });

    socket.on('pong', function (data) {
        console.log('latency: ' + (Date.now() - data.timestamp));
    });
            

    socket.on('sync', function (data) {
        socket.get('id', function (err, id) {
            var offset = clients[id].offset;
            clearTimeout(timeoutID);
            updateServer();
            var player = clients[id],
                grid = player.grid,
                result = {
                    player: player,
                    grid: grid,
                    gametime: Date.now() - player.startTime
                };

            player.grid = null;
            grid.player = null;
            player.canUpdate = false;
            grid.removeCircularity();

            try {
                socket.emit('synced', result);
            } catch (e) {
                console.log(result);
                throw e;
            }

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

    socket.on('sendCreepToSelf', function (request) {
        socket.get('id', function (err, id) {
            request.playerId = id;
            request.action = 'sendToSelf';
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
        
    while (actionQueue.length) {
        action = actionQueue.shift();
        player = clients[action.playerId];

        player.update(Date.now());

        if (action.action == 'build') {
            player.grid.buildTower(Tower, action.x, action.y);
        } else if (action.action == 'send') { 
            for (playerId in clients) {
                if (playerId != action.playerId) { 
                    clients[playerId].sentCreep();
                }
            }
        } else if (action.action == 'sendToSelf') {
            player.sendCreepToSelf();
        }

    }
};

function updateServer() {
    processActionQueue();
    var currTime = Date.now();
    for (playerId in clients) {
        clients[playerId].update(currTime);
    }
    timeoutID = setTimeout(updateServer, 200);
};
