const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 8;

let player1Y = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;

let ballSpeedX = 4;
let ballSpeedY = 2;
let hitCount = 0;

let player1Score = 0;
let player2Score = 0;

const maxScore = 5;
let isGameRunning = true;
let isBallMoving = false; // 控制球是否移動
let gameInterval; // 儲存遊戲的計時器

// 更新記分板
function updateScoreBoard() {
    document.getElementById("scoreBoard").textContent = `玩家1: ${player1Score} | 玩家2: ${player2Score}`;
}

// 重置球的位置
function resetBall(winner) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = winner === "player1" ? 4 : -4; // 失分方先發球
    ballSpeedY = Math.random() > 0.5 ? 2 : -2;
    hitCount = 0; // 重置擊球計數
    isBallMoving = false; // 重置球為暫停狀態
}

// 繪製遊戲畫面
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空畫布

    // 繪製玩家1
    ctx.fillStyle = "blue";
    ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);

    // 繪製玩家2
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight);

    // 繪製球
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
}

// 更新遊戲邏輯
function updateGame() {
    if (!isGameRunning || !isBallMoving) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    if (
        ballX - ballRadius < paddleWidth &&
        ballY > player1Y &&
        ballY < player1Y + paddleHeight
    ) {
        ballSpeedX = Math.min(-ballSpeedX, 10); // 限制最大速度
        ballSpeedY += (ballY - (player1Y + paddleHeight / 2)) * 0.1;
        hitCount++;
    }

    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        ballY > player2Y &&
        ballY < player2Y + paddleHeight
    ) {
        ballSpeedX = Math.max(-ballSpeedX, -10); // 限制最大速度
        ballSpeedY += (ballY - (player2Y + paddleHeight / 2)) * 0.1;
        hitCount++;
    }

    if (ballX - ballRadius < 0) {
        player2Score++;
        updateScoreBoard();
        if (player2Score >= maxScore) {
            endGame("玩家2勝利！");
        } else {
            resetBall("player2");
        }
    }

    if (ballX + ballRadius > canvas.width) {
        player1Score++;
        updateScoreBoard();
        if (player1Score >= maxScore) {
            endGame("玩家1勝利！");
        } else {
            resetBall("player1");
        }
    }

    drawGame();
}

// 控制球拍移動與啟動球
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && player2Y > 0) {
        player2Y -= 20;
    } else if (event.key === "ArrowDown" && player2Y < canvas.height - paddleHeight) {
        player2Y += 20;
    } else if (event.key === "w" && player1Y > 0) {
        player1Y -= 20;
    } else if (event.key === "s" && player1Y < canvas.height - paddleHeight) {
        player1Y += 20;
    } else if (event.key === " ") {
        isBallMoving = true; // 按下空白鍵啟動球
    }
});

// 遊戲結束處理
function endGame(winnerMessage) {
    if (!isGameRunning) return; // 確保只執行一次
    isGameRunning = false;
    clearInterval(gameInterval); // 停止遊戲更新
    const modal = document.getElementById("endModal");
    const endMessage = document.getElementById("endMessage");
    endMessage.textContent = winnerMessage;
    modal.style.display = "flex";
}

// 回到首頁
function goToHomePage() {
    window.location.href = "/game.html";
}

// 重新遊玩
function replayGame() {
    const modal = document.getElementById("endModal");
    modal.style.display = "none";
    isGameRunning = true;
    player1Score = 0;
    player2Score = 0;
    updateScoreBoard();
    resetBall("player1");
    drawGame(); // 繪製初始畫面
    gameInterval = setInterval(updateGame, 1000 / 60); // 重啟遊戲循環
}

// 初始化遊戲
function initGame() {
    const modal = document.getElementById("endModal");
    modal.style.display = "none"; // 確保靜態框隱藏
    updateScoreBoard();
    resetBall("player1");
    drawGame();
    gameInterval = setInterval(updateGame, 1000 / 60); // 啟動遊戲循環
}

// 啟動遊戲
initGame();
