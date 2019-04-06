const board_width = 128;
const board_height = 128;

var game_field_element;
var phantom;
var game_field_container;
var game_field_canvas;
var color_box;

var players = {CROSS:1, CIRCLE:2};
var current_player = players.CROSS;
var game_field = new Array(board_height);

var game_over=false;

//<editor-fold desc="Init">
function init () {
    game_field_element = document.getElementById("game-field");
    phantom = document.getElementById("phantom");
    game_field_container = document.getElementById("game-field-container");
    game_field_canvas = document.getElementById("game-field-canvas");
    color_box = document.getElementById("colorbox");

    initGameBoard();
    color_box.style.backgroundColor="red";
    phantom.className="cross";
    phantom.style.visibility="hidden";

    initEventListeners();
}
function initGameBoard() {
    game_field_element.style.width=(board_width*32)+'px';
    game_field_element.style.height=(board_height*32)+'px';
    game_field_canvas.width=(board_width*32);
    game_field_canvas.height=(board_height*32);

    var context = game_field_canvas.getContext("2d");
    context.strokeStyle='#bababa';
    context.beginPath();
    for (var i = 32.5; i < board_width*32; i+=32) {
        context.moveTo(i, 0);
        context.lineTo(i, board_height*32);
    }
    for (var i = 32.5; i < board_height*32; i+=32) {
        context.moveTo(0, i);
        context.lineTo(board_width*32, i);
    }
    context.stroke();

    for (var i = 0; i < board_height; i++){
        game_field[i] = new Array(board_width);
    }
    for (var i = 0; i < board_height; i++){
        for (var j = 0; j < board_height; j++){
            game_field[i][j] = 0;
        }
    }
}

function initEventListeners () {
    game_field_element.addEventListener("click", fieldClick);
    game_field_element.addEventListener("mouseover", showPhantom);
    game_field_element.addEventListener("mousemove", movePhantom);
    game_field_element.addEventListener("mouseout", hidePhantom);
}

//</editor-fold>

function fieldClick() {
    if (!game_over) {
        var coords = getTilePos();
        if (game_field[coords.y/32][coords.x/32] == 0) {
            var tile = createTile(coords);
            game_field_element.appendChild(tile);

            game_field[coords.y / 32][coords.x / 32] = current_player;
            var line_coords = checkGameOver(coords.x / 32, coords.y / 32);

            if (line_coords.x1 != -1) {
                var dx = Math.floor((line_coords.x2 - line_coords.x1) / 4);
                var dy = Math.floor((line_coords.y2 - line_coords.y1) / 4);
                var x = line_coords.x1;
                var y = line_coords.y1;
                for (var i = 0; i < 5; i++) {
                    console.log(x + ' ' + y);
                    var winner_tile = document.getElementById(x + ' ' + y);
                    winner_tile.className = winner_tile.className + " green";
                    x += dx;
                    y += dy;
                }
                game_over = true;
                if (current_player == players.CROSS) alert("Cross won");
                else alert("Circle won");
            }

            if (current_player == players.CROSS) {
                current_player = players.CIRCLE;
                color_box.style.backgroundColor = "blue";
                phantom.className = "circle"
            }
            else {
                current_player = players.CROSS;
                color_box.style.backgroundColor = "red";
                phantom.className = "cross"
            }
        }
        else {
            alert ("This cell is occupied!");
        }
    }
}

function createTile (coords) {
    var tile = document.createElement('div');
    if (current_player==players.CROSS){
        tile.className="tile cross";
    }
    else {
        tile.className="tile circle";
    }
    tile.style.left=coords.x+'px';
    tile.style.top=coords.y+'px';

    tile.id=(coords.x/32)+' '+(coords.y/32);

    return tile;
}

function checkGameOver(x, y) {
    console.log("Click on:", x, y);
    var i = 0;

    var top = y;
    i = y;
    while (i>0 && game_field[i-1][x] == current_player) i--;
    top=i;

    var bottom = y;
    i = y;
    while  (i<board_height-1 && game_field[i+1][x] == current_player) i++;
    bottom=i;

    if (bottom-top==4) return {x1:x, y1:top, x2:x, y2:bottom};


    var left = x;
    i = x;
    while (i>0 && game_field[y][i-1] == current_player) i--;
    left = i;

    var right = x;
    i = x;
    while (i<board_width-1 && game_field[y][i+1] == current_player) i++;
    right = i;

    if (right-left==4) return {x1:left, y1:y, x2:right, y2:y};


    var top_left_x=x;
    i = x;
    while (i>0 && i+(y-x)>0 && game_field[i+(y-x)-1][i-1] == current_player) i--;
    top_left_x=i;

    var bottom_right_x=x;
    i = x;
    while (i<board_width-1 && i+(y-x)<board_height-1 && game_field[i+(y-x)+1][i+1] == current_player) i++;
    bottom_right_x=i;

    if (bottom_right_x-top_left_x==4) return {x1:top_left_x, y1:top_left_x+(y-x), x2:bottom_right_x, y2:bottom_right_x+(y-x)};


    var bottom_left_x = x;
    i = x;
    while (i>0 && y+(x-i)<board_height-1 && game_field[y+(x-i)+1][i-1] == current_player) i--;
    bottom_left_x = i;

    var top_right_x = x;
    i = x;
    while (i<board_width-1 && y+(x-i)>0 && game_field[y+(x-i)-1][i+1] == current_player) i++;
    top_right_x = i;

    if (top_right_x-bottom_left_x==4) return {x1:bottom_left_x, y1:y+(x-bottom_left_x), x2:top_right_x, y2:y+(x-top_right_x)};

    return {x1:-1, y1:-1, x2:-1, y2:-1};
}

function showPhantom() {
    phantom.style.visibility="visible";
}

function movePhantom () {
    var coords = getTilePos();
    phantom.style.left=coords.x+'px';
    phantom.style.top=coords.y+'px';
}

function hidePhantom() {
    phantom.style.visibility="hidden";
}

function getTilePos() {
    var coords = {};
    coords.x = event.clientX;
    coords.y = event.clientY;

    coords.x-=20;
    coords.y-=20;

    coords.x+=game_field_container.scrollLeft;
    coords.y+=game_field_container.scrollTop;

    coords.x=coords.x-coords.x%32;
    coords.y=coords.y-coords.y%32;

    return coords;
}







window.addEventListener("load", init);