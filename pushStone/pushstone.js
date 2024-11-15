const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 40; // 每個格子的大小
const mapSize = 10; // 地圖的大小（10x10）
const maxLevel = 5; // 最大關卡數
let baseTimeLimit = 60; // 初始時間限制（秒）
let timeLimit; // 每一關的時間限制
let timeRemaining; // 剩餘時間
let level = 1; // 當前關卡
let gameInterval, timerInterval; // 遊戲與計時器的間隔函數

// 玩家初始位置與方塊方向
let player = { x: 1, y: 1, orientation: "small" }; 
let goal = { x: mapSize - 2, y: mapSize - 2 }; // 終點位置
let map = []; // 地圖陣列

// 初始化遊戲
function initGame() {
    timeLimit = baseTimeLimit + (level - 1) * 100; // 設定當前關卡的時間限制
    timeRemaining = timeLimit; // 初始化剩餘時間

    // 重置玩家位置和方向
    player = { x: 1, y: 1, orientation: "small" };

    generateMap(); // 生成地圖
    drawGame(); // 繪製遊戲畫面
    document.getElementById('timeRemaining').textContent = timeRemaining;
    document.getElementById('level').textContent = level;
    clearInterval(gameInterval); // 清除之前的遊戲間隔
    clearInterval(timerInterval); // 清除之前的計時器間隔
    gameInterval = setInterval(updateGame, 100); // 每100毫秒更新遊戲
    timerInterval = setInterval(countdown, 1000); // 每秒倒數計時
}

// 生成地圖
function generateMap() {
    map = Array.from({ length: mapSize }, () => Array(mapSize).fill(0));

    // 確保從起點到終點有一條可行路徑
    createPathToGoal();

    // 生成額外的障礙物
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            // 排除起點和終點，以及通路上的格子
            const isNearGoal = (Math.abs(i - goal.x) <= 1 && Math.abs(j - goal.y) <= 1);
            if (map[i][j] === 0 && Math.random() < 0.1 + level * 0.03 && !((i === 1 && j === 1) || (i === goal.x && j === goal.y))) {
                // 確保終點周圍的障礙物不超過 2 個
                if (isNearGoal && countNearbyObstacles(goal.x, goal.y) >= 2) continue;
                map[i][j] = 1; // 設置牆壁
            }
        }
    }

    map[goal.x][goal.y] = 2; // 設置終點
}

// 使用 DFS 或 BFS 生成一條從起點到終點的路徑
function createPathToGoal() {
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0] // 右, 下, 左, 上
    ];
    const stack = [{ x: 1, y: 1 }]; // 起點
    const visited = Array.from({ length: mapSize }, () => Array(mapSize).fill(false));

    visited[1][1] = true;
    map[1][1] = 0; // 起點保持為空

    while (stack.length > 0) {
        const { x, y } = stack.pop();

        // 如果達到終點則完成
        if (x === goal.x && y === goal.y) {
            map[x][y] = 0;
            break;
        }

        // 隨機打亂方向以增加地圖的隨機性
        directions.sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < mapSize && ny < mapSize && !visited[nx][ny]) {
                visited[nx][ny] = true;
                map[nx][ny] = 0; // 設置通路
                stack.push({ x: nx, y: ny });
            }
        }
    }
}

// 計算終點周圍的障礙物數量
function countNearbyObstacles(goalX, goalY) {
    let obstacleCount = 0;
    for (let i = goalX - 1; i <= goalX + 1; i++) {
        for (let j = goalY - 1; j <= goalY + 1; j++) {
            if (i >= 0 && j >= 0 && i < mapSize && j < mapSize && map[i][j] === 1) {
                obstacleCount++;
            }
        }
    }
    return obstacleCount;
}

// 繪製遊戲畫面
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (map[i][j] === 1) {
                ctx.fillStyle = 'black'; // 繪製牆壁
                ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            } else if (map[i][j] === 2) {
                ctx.fillStyle = 'green'; // 繪製終點
                ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    }

    ctx.fillStyle = 'blue'; // 繪製方塊
    if (player.orientation === "vertical") {
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize * 2);
    } else if (player.orientation === "horizontal") {
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize * 2, gridSize);
    } else {
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize);
    }
}

// 更新遊戲
function updateGame() {
    drawGame(); // 繪製遊戲畫面
    checkWin(); // 檢查是否通關
}

// 倒數計時
function countdown() {
    timeRemaining--; // 剩餘時間減少
    document.getElementById('timeRemaining').textContent = timeRemaining;
    if (timeRemaining <= 0) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        alert("時間到！遊戲結束！");
        window.location.href = '/game.html'; // 返回主頁
    }
}

// 檢查是否通關
function checkWin() {
    if (player.x === goal.x && player.y === goal.y && player.orientation === "small") {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        
        if (level < maxLevel) {
            alert("恭喜通關！進入下一關！");
            level++;
            initGame(); // 進入下一關並重置玩家位置
        } else {
            displayEndOptions(); // 顯示選擇按鈕
        }
    }
}

//顯示提供選擇重新遊玩或者回到首頁
function displayEndOptions() {
    // 獲取靜態框元素，並顯示它
    const modal = document.getElementById('endModal');
    modal.style.display = 'flex';
}

// 回到首頁
function goToHomePage() {
    window.location.href = '/game.html';
}

// 重新遊玩
function replayGame() {
    const modal = document.getElementById('endModal');
    modal.style.display = 'none';
    level = 1;
    initGame();
}


// 處理鍵盤按鍵事件
document.addEventListener("keydown", (event) => {
    let newX = player.x;
    let newY = player.y;
    let newOrientation = player.orientation;

    if (event.key === "ArrowUp") { // 向上移動
        if (player.orientation === "vertical") {
            newY -= 1; // 垂直狀態下只需向上移動一格
            newOrientation = "small";
        } else if (player.orientation === "horizontal") {
            newY -= 1; // 水平狀態向上移動不改變形狀
        } else {
            newY -= 1; // 小方塊狀態向上移動
            newOrientation = "vertical";
        }
    } else if (event.key === "ArrowDown") { // 向下移動
        if (player.orientation === "vertical") {
            newY += 1; // 垂直狀態向下移動只需一格
            newOrientation = "small";
        } else if (player.orientation === "horizontal") {
            newY += 1; // 水平狀態向下移動
        } else {
            newY += 1; // 小方塊狀態向下移動
            newOrientation = "vertical";
        }
    } else if (event.key === "ArrowLeft") { // 向左移動
        if (player.orientation === "horizontal") {
            newX -= 1; // 水平狀態向左移動只需一格
            newOrientation = "small";
        } else if (player.orientation === "vertical") {
            newX -= 1; // 垂直狀態向左移動
        } else {
            newX -= 1; // 小方塊狀態向左移動
            newOrientation = "horizontal";
        }
    } else if (event.key === "ArrowRight") { // 向右移動
        if (player.orientation === "horizontal") {
            newX += 1; // 水平狀態向右移動
            newOrientation = "small";
        } else if (player.orientation === "vertical") {
            newX += 1; // 垂直狀態向右移動
        } else {
            newX += 1; // 小方塊狀態向右移動
            newOrientation = "horizontal";
        }
    }

    // 檢查移動是否合法
    if (isMoveValid(newX, newY, newOrientation)) {
        player.x = newX;
        player.y = newY;
        player.orientation = newOrientation;
        drawGame();
    }
});

// 檢查移動是否合法
function isMoveValid(x, y, orientation) {
    if (orientation === "small") {
        return x >= 0 && y >= 0 && x < mapSize && y < mapSize && map[y][x] !== 1;
    } 
    else if (orientation === "vertical") {
        return x >= 0 && y >= 0 && x < mapSize && y + 1 < mapSize && map[y][x] !== 1 && map[y + 1][x] !== 1;
    } 
    else if (orientation === "horizontal") {
        return x >= 0 && y >= 0 && x + 1 < mapSize && y < mapSize && map[y][x] !== 1 && map[y][x + 1] !== 1;
    }
    return false;
}


// 開始遊戲
initGame();
