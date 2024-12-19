const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let score = 0;
let gameInterval;
let isGameOver = false;

let dropSpeed = 800; // 方塊掉落速度（毫秒）
let lastDropTime = Date.now(); // 上次掉落的時間戳

// 俄羅斯方塊的形狀
const SHAPES = {
    I: [[2, 2, 2, 2]], 
    J: [[0, 3], [0, 3], [3, 3]],
    L: [[4, 0], [4, 0], [4, 4]],
    O: [[5, 5], [5, 5]],
    S: [[0, 6, 6], [6, 6, 0]],
    T: [[7, 7, 7], [0, 7, 0]],
    Z: [[8, 8, 0], [0, 8, 8]]
};

const COLORS = {
    0: '#f0f0f0', 
    2: '#FF5733', 
    3: '#33FF57', 
    4: '#5733FF', 
    5: '#FFD700', 
    6: '#40E0D0', 
    7: '#FF1493', 
    8: '#8A2BE2'  
};
class Piece {
    constructor(shape) {
        this.shape = shape;
        this.row = -1;
        this.col = Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2);
    }

    moveDown() {
        this.row++;
        if (this.collides()) {
            this.row--;
            this.mergeToBoard();
            spawnNewPiece();
        }
    }

    moveLeft() {
        this.col--;
        if (this.collides()) this.col++;
    }

    moveRight() {
        this.col++;
        if (this.collides()) this.col--;
    }

    rotate() {
        const prevShape = this.shape;
        this.shape = this.shape[0].map((_, i) => this.shape.map(row => row[i]).reverse());
        if (this.collides()) this.shape = prevShape; 
    }

    collides() {
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                if (
                    this.shape[r][c] &&
                    (this.row + r >= ROWS || this.col + c < 0 || this.col + c >= COLS || 
                    (this.row + r >= 0 && board[this.row + r][this.col + c])) // 只檢查在棋盤可見範圍內的部分
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    mergeToBoard() {
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                if (this.shape[r][c]) board[this.row + r][this.col + c] = this.shape[r][c];
            }
        }
        clearFullRows();
    }
}

function clearFullRows() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100; // 每消除一行，分數+100
            r++; // 重新檢查該行
        }
    }
    updateScore(); // 更新分數
}

function spawnNewPiece() {
    const shapeNames = Object.keys(SHAPES);
    const randomShape = shapeNames[Math.floor(Math.random() * shapeNames.length)];
    currentPiece = new Piece(SHAPES[randomShape]);
    // 這裡不立即檢測 collides，而是確保方塊的可見部分不會立刻重疊
    if (currentPiece.collides()) {
        gameOver();
    }
}

function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

function drawSquare(x, y, type) {
    ctx.fillStyle = COLORS[type]; 
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawPiece() {
    currentPiece.shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) drawSquare(currentPiece.col + c, currentPiece.row + r, value);
        });
    });
}

function updateGame() {
    if (isGameOver) return;

    const currentTime = Date.now();
    if (currentTime - lastDropTime > dropSpeed) {
        currentPiece.moveDown();
        lastDropTime = currentTime;
    }

    drawBoard();
    drawPiece();
    requestAnimationFrame(updateGame);
}

function updateScore() {
    document.getElementById('score').textContent = score;
    const bestScore = localStorage.getItem('bestScore') || 0;
    if (score > bestScore) {
        localStorage.setItem('bestScore', score);
        document.getElementById('bestScore').textContent = score;
    } else {
        document.getElementById('bestScore').textContent = bestScore;
    }
}


function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    document.getElementById('endModal').style.display = 'flex';
    document.getElementById('finalScore').textContent = score; // 顯示最終分數
}   

function replayGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    isGameOver = false;
    document.getElementById('endModal').style.display = 'none';
    updateScore(); // 更新分數顯示
    initGame();
}

function goToHomePage() {
    window.location.href = '/game.html';
}

function initGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    currentPiece = null;
    isGameOver = false; // 重置遊戲狀態
    document.getElementById('endModal').style.display = 'none'; // 確保隱藏靜態框
    spawnNewPiece();
    lastDropTime = Date.now();
    updateScore();
    requestAnimationFrame(updateGame);
}



document.addEventListener('keydown', e => {
    if (!isGameOver) {
        if (e.key === 'ArrowLeft') currentPiece.moveLeft();
        if (e.key === 'ArrowRight') currentPiece.moveRight();
        if (e.key === 'ArrowDown') currentPiece.moveDown();
        if (e.key === 'ArrowUp') currentPiece.rotate();
        if (e.key === ' ') {
            while (!currentPiece.collides()) currentPiece.row++;
            currentPiece.row--;
            currentPiece.mergeToBoard();
            spawnNewPiece();
        }
    }
});

initGame();
