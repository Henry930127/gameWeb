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

// 俄羅斯方塊的形狀
const SHAPES = {
    I: [[2, 2, 2, 2]], 
    J: [
        [0, 3],
        [0, 3],
        [3, 3]
    ],
    L: [
        [4, 0],
        [4, 0],
        [4, 4]
    ],
    O: [
        [5, 5],
        [5, 5]
    ],
    S: [
        [0, 6, 6],
        [6, 6, 0]
    ],
    T: [
        [7, 7, 7],
        [0, 7, 0]
    ],
    Z: [
        [8, 8, 0],
        [0, 8, 8]
    ]
};

const COLORS = {
    0: '#f0f0f0',  // 空白格
    2: '#FF5733',  // I
    3: '#33FF57',  // J
    4: '#5733FF',  // L
    5: '#FFD700',  // O
    6: '#40E0D0',  // S
    7: '#FF1493',  // T
    8: '#8A2BE2'   // Z
};

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.row = 0;
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
        if (this.collides()) this.shape = prevShape; // 如果碰撞，還原回原來的形狀
    }

    collides() {
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                if (
                    this.shape[r][c] &&
                    (this.row + r >= ROWS || this.col + c < 0 || this.col + c >= COLS || board[this.row + r][this.col + c])
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
            score += 100;
            r++;
        }
    }
}

function spawnNewPiece() {
    const shapeNames = Object.keys(SHAPES);
    const randomShape = shapeNames[Math.floor(Math.random() * shapeNames.length)];
    currentPiece = new Piece(SHAPES[randomShape], randomShape);
    if (currentPiece.collides()) {
        gameOver();
    }
}

function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawSquare(c, r, board[r][c]); // 根據 board 的值繪製顏色
        }
    }
}

function drawSquare(x, y, type) {
    // 填充方塊的顏色
    ctx.fillStyle = COLORS[type]; 
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 繪製格線
    ctx.strokeStyle = '#333'; // 格線的顏色
    ctx.lineWidth = 1; // 格線的粗細
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); // 畫出格線
}

function drawPiece() {
    currentPiece.shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) drawSquare(currentPiece.col + c, currentPiece.row + r, value); // 傳入 value
        });
    });
}

function updateGame() {
    if (isGameOver) return;
    currentPiece.moveDown();
    drawBoard();
    drawPiece();
    updateScore();
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    document.getElementById('endModal').style.display = 'flex';
}

function replayGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    isGameOver = false;
    document.getElementById('endModal').style.display = 'none';
    initGame();
}

function goToHomePage() {
    window.location.href = '/game.html';
}

function initGame() {
    currentPiece = null;
    spawnNewPiece();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 500);
}

document.addEventListener('keydown', e => {
    if (!isGameOver) {
        if (e.key === 'ArrowLeft') currentPiece.moveLeft();
        if (e.key === 'ArrowRight') currentPiece.moveRight();
        if (e.key === 'ArrowDown') currentPiece.moveDown();
        if (e.key === 'ArrowUp') currentPiece.rotate();
        if (e.key === ' ') {
            while (!currentPiece.collides()) {
                currentPiece.row++; // 只控制行數，而不觸發 spawnNewPiece()
            }
            currentPiece.row--; // 回到上一個有效位置
            currentPiece.mergeToBoard(); // 合併方塊到棋盤
            spawnNewPiece(); // 生成新方塊
        }
    }
});

initGame();
