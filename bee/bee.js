const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 500;
const scoreBoard = document.getElementById('scoreBoard');

class BeeGame {
    constructor() {
        this.totalTime = 300; // 5 分鐘，以秒為單位
        this.targetScore = 100;
        this.playerScore = 0;
        this.bullets = [];
        this.blocks = [];
        this.attacks = []; // 新增攻擊物件陣列
        this.playerX = canvas.width / 2;
        this.isRunning = true;
        this.level = 1;
        this.maxBlocks = 10; // 方塊數量上限
        this.minBlocks = 5;
        this.startTime = Date.now(); // 記錄遊戲開始時間
    }

    start() {
        this.resetGame();
        this.timer = setInterval(() => this.update(), 60); // 每隔 60 毫秒更新一次
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.updateScoreBoard();
    }

    resetGame() {
        this.playerScore = 0;
        this.bullets = [];
        this.blocks = this.generateBlocks();
        this.attacks = []; // 重置攻擊物件
        this.startTime = Date.now(); // 重置開始時間
        this.totalTime = this.totalTime + this.level * 50;//增加時間
        this.drawGame();
        this.updateScoreBoard();
    }

    generateBlocks() {
        const blocks = [];
        for (let i = 0; i < this.maxBlocks; i++) {
            blocks.push({ x: Math.floor(Math.random() * (canvas.width - 40)), y: Math.random() * 100 });
        }
        return blocks;
    }

    addNewBlockIfNeeded() {
        // 當 blocks 數量低於 minBlocks 時，生成新的方塊
        while (this.blocks.length < this.minBlocks) {
            this.blocks.push({
                x: Math.floor(Math.random() * (canvas.width - 40)),
                y: Math.random() * 100
            });
        }
    }

    drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 繪製得分方塊
        ctx.fillStyle = 'green';
        this.blocks.forEach(block => {
            ctx.fillRect(block.x, block.y, 40, 20);
        });

        // 繪製子彈
        ctx.fillStyle = 'red';
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 5, 10);
        });

        // 繪製攻擊物件
        ctx.fillStyle = 'purple';
        this.attacks.forEach(attack => {
            ctx.fillRect(attack.x, attack.y, 5, 10);
        });

        // 繪製玩家
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.playerX, canvas.height - 30, 40, 20);
    }

    updateScoreBoard() {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const remainingTime = this.totalTime - elapsedSeconds;
        scoreBoard.innerHTML = `<strong>Level:</strong> ${this.level} <br> 
                                <strong>Score:</strong> ${this.playerScore} / ${this.targetScore} <br>
                                <strong>Time Remaining:</strong> ${Math.floor(remainingTime / 60)}:${remainingTime % 60}`;
    }

    update() {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const remainingTime = this.totalTime - elapsedSeconds;

        if (remainingTime <= 0) {
            this.gameOver();
        }

        this.moveBullets();
        this.moveAttacks(); // 移動攻擊物件
        this.checkCollisions();
        this.randomlyAttack(); // 隨機發射攻擊
        this.addNewBlockIfNeeded(); // 檢查並補充方塊

        if (this.playerScore >= this.targetScore) {
            this.nextLevel();
        }

        this.drawGame();
        this.updateScoreBoard();
    }


    moveBullets() {
        this.bullets = this.bullets.filter(bullet => bullet.y > 0);
        this.bullets.forEach(bullet => {
            bullet.y -= 5;
        });
    }

    // 新增：移動攻擊物件並檢查是否撞到玩家
    moveAttacks() {
        this.attacks = this.attacks.filter(attack => attack.y < canvas.height);
        this.attacks.forEach(attack => {
            attack.y += 5;

            // 檢查攻擊物件是否撞到玩家
            if (
                attack.x < this.playerX + 40 &&
                attack.x + 5 > this.playerX &&
                attack.y < canvas.height - 30 + 20 &&
                attack.y + 10 > canvas.height - 30
            ) {
                this.gameOver();
            }
        });
    }

    // 新增：隨機選擇方塊發射攻擊
    randomlyAttack() {
        if (Math.random() < 0.1) { // 設置發射機率
            const randomBlock = this.blocks[Math.floor(Math.random() * this.blocks.length)];
            if (randomBlock) {
                this.attacks.push({ x: randomBlock.x + 17.5, y: randomBlock.y + 20 });
            }
        }
    }

    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.blocks.forEach((block, blockIndex) => {
                if (
                    bullet.x < block.x + 40 &&
                    bullet.x + 5 > block.x &&
                    bullet.y < block.y + 20 &&
                    bullet.y + 10 > block.y
                ) {
                    this.bullets.splice(bulletIndex, 1); // 移除子彈
                    this.blocks.splice(blockIndex, 1); // 移除方塊
                    this.playerScore += 10;
                }
            });
        });
    }

    nextLevel() {
        if(this.level < 5){
            this.level++;
            this.targetScore += this.level * 50;
            this.totalTime = 300; // 重置時間限制為 5 分鐘
            this.maxBlocks = this.level * 5;
            this.resetGame(); 
        } else {
            clearInterval(this.timer);
            alert("恭喜通過所有關卡！");
            window.location.href = 'game.html'; // 通關後跳轉回首頁
        }
    }

    gameOver() {
        clearInterval(this.timer);
        alert("挑戰失敗！重新挑戰吧！");
        window.location.href = 'game.html';
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowLeft' && this.playerX > 0) {
            this.playerX -= 10;
        } else if (e.key === 'ArrowRight' && this.playerX < canvas.width - 40) {
            this.playerX += 10;
        } else if (e.key === ' ') {
            this.shoot();
        }
    }

    shoot() {
        this.bullets.push({ x: this.playerX + 17.5, y: canvas.height - 40 });
    }
}

const beeGame = new BeeGame();
beeGame.start();
