var player = new Player.Player(),
    grid = new Grid.Grid(),
    BLOCKSIZE = grid.sqSize,
    mouseX,
    mouseY,
    draggingItem, 
    addMulitple,
    requestId;

function draw (timestamp) { 
    var canvas = document.getElementById('moving-objs'),
        ctx = canvas.getContext('2d');

    player.update(Date.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (draggingItem) {
        ctx.fillStyle = draggingItem.style.background;
        ctx.fillRect(mouseX - BLOCKSIZE/2 - 3, mouseY - BLOCKSIZE/2 - 3, BLOCKSIZE - 2, BLOCKSIZE - 2);
    }

    for (var i = 0; i < player.grid.projectiles.length; i++) {
        player.grid.projectiles[i].draw(canvas, ctx);
    }

    for (var i = 0; i < player.grid.creeps.length; i++) {
        player.grid.creeps[i].draw(canvas, ctx);
    }

    requestId = requestAnimationFrame(draw);
}

function setup() { 
    var board = document.getElementById('board');

    function onClick(e) {
        if (draggingItem) {
            var x = Math.floor(e.pageX / BLOCKSIZE),
                y = Math.floor(e.pageY / BLOCKSIZE);
            grid.buildTower(Tower[draggingItem.className], x, y);
            console.log('tower being built');
            if (!addMulitple)
                draggingItem = false;
        }
    };

    $(board).click(onClick);

    board.addEventListener("mousemove", function (e) {
        var canvas = document.getElementById('moving-objs'),
            ctx = canvas.getContext("2d");
        if (draggingItem) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        }
    });

    $(document).keydown(function (e) {
        if (e.keyCode === 'A'.charCodeAt(0)) {
            addMulitple = true;
        } else if (e.keyCode === 27) {
            draggingItem = false;
        }
    });

    $(document).keyup(function (e) { 
        addMulitple = false;
    });

    menu = new Menu();
    menu.addTower(Tower.Tower);
    menu.update();

    player.attachGrid(grid);
    grid.createBackground();
    player.connect();

    setInterval(player.sync.bind(player), 500);
    requestId = window.requestAnimationFrame(draw);
    //setInterval(player.sendCreepToSelf.bind(player), 1500);
};

setup();
