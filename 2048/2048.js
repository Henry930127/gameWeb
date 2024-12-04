const boardSize = 4; // 棋盤大小
let board = []; // 棋盤數據
let score = 0; // 分數
let bestScore = localStorage.getItem('bestScore') || 0; // 從 localStorage 讀取最高分

// 初始化遊戲
function initGame() {
    const modal = document.getElementById("endModal");
    modal.style.display = "none"; // 確保靜態框隱藏
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0)); // 建立空的棋盤
    score = 0; // 初始化分數
    document.getElementById('currentScore').textContent = score;
    document.getElementById('bestScore').textContent = bestScore; // 更新最高分顯示
    addRandomTile(); // 隨機生成第一個數字方塊
    addRandomTile(); // 隨機生成第二個數字方塊
    updateBoard(); // 更新棋盤畫面
}

// 隨機生成數字方塊
function addRandomTile() {
    const emptyTiles = []; // 儲存所有空方格的位置
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) emptyTiles.push({ x: i, y: j });
        }
    }
    if (emptyTiles.length > 0) {
        const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[x][y] = Math.random() < 0.9 ? 2 : 4; // 隨機生成 2 或 4
    }
}

// 更新棋盤畫面
function updateBoard() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = ''; // 清空現有的畫面

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${board[i][j]}`; // 動態設置方塊樣式
            tile.textContent = board[i][j] > 0 ? board[i][j] : ''; // 如果數字為 0，顯示為空
            gameContainer.appendChild(tile); // 添加方塊到棋盤容器
        }
    }

    document.getElementById('currentScore').textContent = score; // 更新分數
}

// 合併數字邏輯
function combineNumbers(array) {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] !== 0 && array[i] === array[i + 1]) {
            array[i] *= 2;
            array[i + 1] = 0;
            updateScore(score + array[i]); // 更新分數並檢查最高分
        }
    }
    return array;
}

// 更新分數並檢查最高分
function updateScore(newScore) {
    score = newScore;
    document.getElementById('currentScore').textContent = score;

    // 更新最高分
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore); // 保存到 localStorage
        document.getElementById('bestScore').textContent = bestScore; // 更新最高分顯示
    }
}

// 向左移動邏輯
function moveLeft() {
    let moved = false;
    for (let i = 0; i < boardSize; i++) {
        let row = board[i].filter(num => num !== 0); // 移除 0
        row = combineNumbers(row); // 合併相鄰數字
        while (row.length < boardSize) row.push(0); // 補齊為 4 個
        if (board[i].toString() !== row.toString()) moved = true;
        board[i] = row; // 更新行數據
    }
    return moved;
}

// 向右移動邏輯
function moveRight() {
    let moved = false;
    for (let i = 0; i < boardSize; i++) {
        let row = board[i].filter(num => num !== 0); // 移除 0
        row = combineNumbers(row.reverse()).reverse(); // 反轉合併後再反轉
        while (row.length < boardSize) row.unshift(0); // 補齊為 4 個
        if (board[i].toString() !== row.toString()) moved = true;
        board[i] = row; // 更新行數據
    }
    return moved;
}

// 向上移動邏輯
function moveUp() {
    let moved = false;
    for (let j = 0; j < boardSize; j++) {
        let column = [];
        for (let i = 0; i < boardSize; i++) {
            if (board[i][j] !== 0) column.push(board[i][j]); // 收集列數據
        }
        column = combineNumbers(column); // 合併相鄰數字
        while (column.length < boardSize) column.push(0); // 補齊為 4 個
        for (let i = 0; i < boardSize; i++) {
            if (board[i][j] !== column[i]) moved = true;
            board[i][j] = column[i]; // 更新列數據
        }
    }
    return moved;
}

// 向下移動邏輯
function moveDown() {
    let moved = false;
    for (let j = 0; j < boardSize; j++) {
        let column = [];
        for (let i = 0; i < boardSize; i++) {
            if (board[i][j] !== 0) column.push(board[i][j]); // 收集列數據
        }
        column = combineNumbers(column.reverse()).reverse(); // 反轉合併後再反轉
        while (column.length < boardSize) column.unshift(0); // 補齊為 4 個
        for (let i = 0; i < boardSize; i++) {
            if (board[i][j] !== column[i]) moved = true;
            board[i][j] = column[i]; // 更新列數據
        }
    }
    return moved;
}

// 檢查遊戲是否結束
function checkGameOver() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) return false; // 還有空格
            if (i > 0 && board[i][j] === board[i - 1][j]) return false; // 垂直方向可以合併
            if (j > 0 && board[i][j] === board[i][j - 1]) return false; // 水平方向可以合併
        }
    }
    return true; // 遊戲結束
}

// 鍵盤事件監聽
document.addEventListener('keydown', (e) => {
    let moved = false;
    if (e.key === 'ArrowUp') moved = moveUp();
    else if (e.key === 'ArrowDown') moved = moveDown();
    else if (e.key === 'ArrowLeft') moved = moveLeft();
    else if (e.key === 'ArrowRight') moved = moveRight();

    if (moved) {
        addRandomTile(); // 如果有移動則新增數字方塊
        updateBoard(); // 更新棋盤畫面
        if (checkGameOver()) {
            document.getElementById('endMessage').textContent = '遊戲結束！';
            document.getElementById('endModal').style.display = 'flex'; // 顯示靜態框
        }
    }
});

// 回到首頁
function goToHomePage() {
    window.location.href = '/game.html'; 
}

// 重新開始遊戲
function replayGame() {
    const modal = document.getElementById('endModal');
    modal.style.display = 'none';
    initGame();
}

// 啟動遊戲
initGame();
