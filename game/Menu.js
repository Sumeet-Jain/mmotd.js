var BLOCKSIZE = Grid.sqSize;
function Menu() {
    this.towerList = [];
}

Menu.prototype.update = function() {
    var menuNode = document.getElementById('menu'),
        i,
        node;

    for (i = 0; i < this.towerList.length; i++) {
        tower = new this.towerList[i]();
        node = document.createElement('div');
        node.className = this.towerList[i].name;
        node.style.background = tower.background;
        node.style.width = BLOCKSIZE + "px";
        node.style.height = BLOCKSIZE + "px";
        node.addEventListener("click", function (e) {
            draggingItem = this;
            mouseX = e.pageX;
            mouseY = e.pageY;
        });
        menuNode.appendChild(node);
        $(node).popover({
            placement: "left",
            trigger: "hover",
            content: "hello world",
        });
    }
};

Menu.prototype.addTower = function (Tower) {
    this.towerList.push(Tower);
};
