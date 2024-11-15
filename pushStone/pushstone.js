const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 40;
const mapSize = 10;
const maxLevel = 5;
let baseTimeLimit = 60;
let timeLimit;
let timeRemaining;
let level = 1;
let gameInterval, timerInterval;

let player = { x: 1, y: 1, orientation: "small" }; // 初始方块位置和方向
let goal = { x: mapSize - 2, y: mapSize - 2 };
let map = [];

function initGame() {
    timeLimit = baseTimeLimit + (level - 1) * 100;
    timeRemaining = timeLimit;
    generateMap();
    drawGame();
    document.getElementById('timeRemaining').textContent = timeRemaining;
    document.getElementById('level').textContent = level;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameInterval = setInterval(updateGame, 100);
    timerInterval = setInterval(countdown, 1000);
}

function generateMap() {
    map = Array.from({ length: mapSize }, () => Array(mapSize).fill(0));
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (Math.random() < 0.2 + level * 0.05 && !(i === 1 && j === 1) && !(i === mapSize - 2 && j === mapSize - 2)) {
                map[i][j] = 1;
            }
        }
    }
    map[goal.x][goal.y] = 2;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (map[i][j] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            } else if (map[i][j] === 2) {
                ctx.fillStyle = 'green';
                ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    }

    ctx.fillStyle = 'blue';
    if (player.orientation === "vertical") {
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize * 2);
    } else if (player.orientation === "horizontal") {
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize * 2, gridSize);
    } else {
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize);
    }
}

function updateGame() {
    drawGame();
    checkWin();
}

function countdown() {
    timeRemaining--;
    document.getElementById('timeRemaining').textContent = timeRemaining;
    if (timeRemaining <= 0) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        alert("时间到！游戏结束！");
        window.location.href='/game.html';
    }
}

function checkWin() {
    if (player.x === goal.x && player.y === goal.y && player.orientation === "small") {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        if (level < maxLevel) {
            alert("恭喜通关！进入下一关！");
            level++;
            initGame();
        } else {
            alert("恭喜完成所有关卡！");
            level = 1;
            initGame();
        }
    }
}

document.addEventListener("keydown", (event) => {
    let newX = player.x;
    let newY = player.y;
    let newOrientation = player.orientation;

    if (event.key === "ArrowUp") {
        if (player.orientation === "vertical") {
            newY -= 2;
            newOrientation = "small";
        } else if (player.orientation === "horizontal") {
            newY -= 1;
        } else {
            newY -= 1;
            newOrientation = "vertical";
        }
    } else if (event.key === "ArrowDown") {
        if (player.orientation === "vertical") {
            newY += 1;
            newOrientation = "small";
        } else if (player.orientation === "horizontal") {
            newY += 1;
        } else {
            newY += 2;
            newOrientation = "vertical";
        }
    } else if (event.key === "ArrowLeft") {
        if (player.orientation === "horizontal") {
            newX -= 2;
            newOrientation = "small";
        } else if (player.orientation === "vertical") {
            newX -= 1;
        } else {
            newX -= 1;
            newOrientation = "horizontal";
        }
    } else if (event.key === "ArrowRight") {
        if (player.orientation === "horizontal") {
            newX += 1;
            newOrientation = "small";
        } else if (player.orientation === "vertical") {
            newX += 1;
        } else {
            newX += 2;
            newOrientation = "horizontal";
        }
    }

    if (isMoveValid(newX, newY, newOrientation)) {
        player.x = newX;
        player.y = newY;
        player.orientation = newOrientation;
        drawGame();
    }
});

function isMoveValid(x, y, orientation) {
    if (orientation === "small") {
        return x >= 0 && y >= 0 && x < mapSize && y < mapSize && map[y][x] !== 1;
    } else if (orientation === "vertical") {
        return x >= 0 && y >= 0 && x < mapSize && y + 1 < mapSize && map[y][x] !== 1 && map[y + 1][x] !== 1;
    } else if (orientation === "horizontal") {
        return x >= 0 && y >= 0 && x + 1 < mapSize && y < mapSize && map[y][x] !== 1 && map[y][x + 1] !== 1;
    }
    return false;
}

initGame();
