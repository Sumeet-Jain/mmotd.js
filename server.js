var connect = require('connect'),
    PF = require('pathfinding'),
    Grid = require('./game/Grid.js'),
    Tower = require('./game/Tower.js'),
    Creep = require('./game/Creep.js'),
    Projectile = require('./game/Projectile.js'),
    serveer = connect.createServer(connect.static(__dirname));

connect.createServer(
    connect.static(__dirname)
).listen(8080);
