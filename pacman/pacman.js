const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');

class PacmanGame {
    constructor() {
        this.timeLimit = 600; // 10分鐘
        this.mapSize = 10; // 地圖初始大小（10x10格）
        this.coinCount = 10; // 金幣數量
        this.gridSize = 40; // 每格的像素大小
        this.map = []; // 地圖陣列
        this.level = 1;
        this.coinsCollected = 0;
        this.player = { x: 0, y: 0 }; // 玩家位置
    }

    start() {
        this.resetGame();
        this.timer = setInterval(() => this.update(), 1000);
        document.addEventListener('keydown', (e) => this.movePlayer(e));
        this.updateScoreBoard();
    }

    resetGame() {
        this.coinsCollected = 0;
        this.generateMap();
        this.drawMap();
        this.updateScoreBoard();
    }

    generateMap() {
        canvas.width = this.mapSize * this.gridSize;
        canvas.height = this.mapSize * this.gridSize;

        this.map = Array.from({ length: this.mapSize }, () =>
            Array.from({ length: this.mapSize }, () => 0)
        );

        for (let i = 0; i < this.mapSize; i++) {
            for (let j = 0; j < this.mapSize; j++) {
                if (Math.random() < 0.2) {
                    this.map[i][j] = 1;
                }
            }
        }

        let coinsPlaced = 0;
        while (coinsPlaced < this.coinCount) {
            const x = Math.floor(Math.random() * this.mapSize);
            const y = Math.floor(Math.random() * this.mapSize);
            if (this.map[x][y] === 0 && this.isReachable(x, y)) {
                this.map[x][y] = 2;
                coinsPlaced++;
            }
        }

        this.map[0][0] = 0;
        this.player = { x: 0, y: 0 };
    }

    isReachable(x, y) {
        const visited = Array.from({ length: this.mapSize }, () => Array(this.mapSize).fill(false));
        const queue = [[0, 0]];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        visited[0][0] = true;

        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            if (cx === x && cy === y) return true;

            for (const [dx, dy] of directions) {
                const nx = cx + dx;
                const ny = cy + dy;

                if (nx >= 0 && nx < this.mapSize && ny >= 0 && ny < this.mapSize && !visited[nx][ny] && this.map[nx][ny] !== 1) {
                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }
        return false;
    }

    drawMap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.mapSize; i++) {
            for (let j = 0; j < this.mapSize; j++) {
                if (this.map[i][j] === 1) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(j * this.gridSize, i * this.gridSize, this.gridSize, this.gridSize);
                } else if (this.map[i][j] === 2) {
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(j * this.gridSize + this.gridSize / 2, i * this.gridSize + this.gridSize / 2, this.gridSize / 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.player.x * this.gridSize + this.gridSize / 2, this.player.y * this.gridSize + this.gridSize / 2, this.gridSize / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    updateScoreBoard() {
        scoreBoard.innerHTML = `<strong>Level:</strong> ${this.level} <br> 
                                <strong>Coins Collected:</strong> ${this.coinsCollected} / ${this.coinCount} <br>
                                <strong>Time Remaining:</strong> ${Math.floor(this.timeLimit / 60)}:${this.timeLimit % 60}`;
    }

    movePlayer(event) {
        const { x, y } = this.player;
        if (event.key === 'ArrowUp' && y > 0 && this.map[y - 1][x] !== 1) this.player.y--;
        if (event.key === 'ArrowDown' && y < this.mapSize - 1 && this.map[y + 1][x] !== 1) this.player.y++;
        if (event.key === 'ArrowLeft' && x > 0 && this.map[y][x - 1] !== 1) this.player.x--;
        if (event.key === 'ArrowRight' && x < this.mapSize - 1 && this.map[y][x + 1] !== 1) this.player.x++;
    
        // 檢查是否收集到金幣
        if (this.map[this.player.y][this.player.x] === 2) {
            this.map[this.player.y][this.player.x] = 0; // 移除金幣
            this.coinsCollected++; // 增加收集計數
            this.updateScoreBoard(); // 更新記分板
        }
    
        this.drawMap(); // 繪製地圖
    
        // 檢查是否收集完所有金幣
        if (this.coinsCollected === this.coinCount) {
            this.nextLevel(); // 進入下一關
        }
    }

    update() {
        this.timeLimit--;
        if (this.timeLimit <= 0) {
            this.gameOver();
        }
        this.updateScoreBoard();
    }

    nextLevel() {
        if (this.level < 3) {
            this.level++;
            this.mapSize++;
            this.coinCount += 5;
            this.coinsCollected = 0; // 重置收集金幣數量
            this.timeLimit = 600;
            this.resetGame();
        } else {
            clearInterval(this.timer);
            this.displayEndOptions();// 使用靜態框
        }
    }

    gameOver() {
        clearInterval(this.timer);
        this.displayEndOptions(); // 使用靜態框
    }

    // 顯示靜態框的方法
    displayEndOptions() {
        const modal = document.getElementById('endModal');
        modal.style.display = 'flex';
    }

    // 回到首頁方法
    goToHomePage() {
        window.location.href = '/game.html'; // 回到首頁
    }

    // 重新遊玩方法
    replayGame() {
        const modal = document.getElementById('endModal');
        modal.style.display = 'none';
        this.level = 1; // 重置到第一關
        this.start(); // 重新初始化遊戲
    }
}

const pacmanGame = new PacmanGame();
pacmanGame.start();
// 將方法設置為全域範圍，讓 HTML 按鈕可以使用
window.goToHomePage = function() {
    pacmanGame.goToHomePage();
};

window.replayGame = function() {
    pacmanGame.replayGame();
};
