var Grid = require('./Grid'),
    BLOCKSIZE = Grid.sqSize;

function Menu() {
    this.towerList = [];
    this.draggingItem = false;
    this.mouseX = null;
    this.mouseY = null;
}

Menu.prototype.update = function() {
    var menuNode = document.getElementById('menu'),
        menu = this,
        i,
        node,
        tower;

    for (i = 0; i < this.towerList.length; i++) {
        tower = new this.towerList[i]();
        node = document.createElement('div');
        node.className = this.towerList[i].name;
        node.style.background = tower.background;
        node.style.width = BLOCKSIZE + "px";
        node.style.height = BLOCKSIZE + "px";
        node.addEventListener("click", function (e) {
            menu.draggingItem = this;
            menu.mouseX = e.pageX;
            menu.mouseY = e.pageY;
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

module.exports = Menu;
