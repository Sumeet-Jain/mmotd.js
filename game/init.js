(function () {
    var Player = require('./Player'),
        Grid = require('./Grid'),
        Menu = require('./Menu'),
        Tower = require('./Tower'),
        player = new Player(),
        grid = new Grid(),
        BLOCKSIZE = grid.sqSize,
        menu = new Menu(),
        addMulitple,
        requestId;


    function draw (timestamp) { 
        var canvas = document.getElementById('moving-objs'),
            ctx = canvas.getContext('2d');

        player.update(Date.now());

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (menu.draggingItem) {
            ctx.fillStyle = menu.draggingItem.style.background;
            ctx.fillRect(menu.mouseX - BLOCKSIZE/2 - 3, menu.mouseY - BLOCKSIZE/2 - 3, BLOCKSIZE - 2, BLOCKSIZE - 2);
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
            if (menu.draggingItem) {
                var x = Math.floor(e.pageX / BLOCKSIZE),
                    y = Math.floor(e.pageY / BLOCKSIZE);
                grid.buildTower(Tower, x, y);
                if (!addMulitple)
                    menu.draggingItem = false;
            }
        };

        $(board).click(onClick);
        $('#send-btn').click(player.sendCreep.bind(player));

        board.addEventListener("mousemove", function (e) {
            var canvas = document.getElementById('moving-objs'),
                ctx = canvas.getContext("2d");
            if (menu.draggingItem) {
                menu.mouseX = e.pageX;
                menu.mouseY = e.pageY;
            }
        });

        $(document).keydown(function (e) {
            if (e.keyCode === 'A'.charCodeAt(0)) {
                addMulitple = true;
            } else if (e.keyCode === 27) {
                menu.draggingItem = false;
            }
        });

        $(document).keyup(function (e) { 
            addMulitple = false;
        });

        menu.addTower(Tower);
        menu.update();

        player.attachGrid(grid);
        grid.createBackground();
        player.connect();

        setInterval(player.sync.bind(player), 500);
        requestId = window.requestAnimationFrame(draw);
        //setInterval(player.sendCreepToSelf.bind(player), 1500);
    };

    setup();
//    window['player'] = player;
})();
