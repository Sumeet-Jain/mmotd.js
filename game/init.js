var player = new Player.Player(),
    grid = new Grid.Grid();

player.attachGrid(grid);

grid.createBackground();
player.connect();

//setInterval(player.sendCreep.bind(player), 1000);

function draw (timestamp) { 
    var canvas = document.getElementById('moving-objs'),
        ctx = canvas.getContext('2d');

    player.update(timestamp);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < player.grid.projectiles.length; i++) {
        player.grid.projectiles[i].draw(canvas, ctx);
    }

    for (var i = 0; i < player.grid.creeps.length; i++) {
        player.grid.creeps[i].draw(canvas, ctx);
    }

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

setInterval(player.sync.bind(player), 5000);
