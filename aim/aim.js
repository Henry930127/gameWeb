const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let score = 0;
let timeRemaining = 60; // 1分鐘
let isGameRunning = true;

const targets = [];
const maxTargets = 2;

// 更新記分板
function updateScoreBoard() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById("scoreBoard").textContent = `分數: ${score} | 剩餘時間: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

// 生成目標
function generateTarget() {
    const x = Math.random() * (canvas.width - 20) + 10;
    const y = Math.random() * (canvas.height - 20) + 10;
    const radius = 20;
    targets.push({ x, y, radius });
}

// 繪製目標
function drawTargets() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    targets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    });
}

// 檢查是否擊中目標
function checkHit(mouseX, mouseY) {
    targets.forEach((target, index) => {
        const dist = Math.sqrt((mouseX - target.x) ** 2 + (mouseY - target.y) ** 2);
        if (dist < target.radius) {
            score++;
            targets.splice(index, 1); // 移除目標
            generateTarget(); // 生成新目標
            updateScoreBoard();
        }
    });
}

// 更新遊戲
function updateGame() {
    if (!isGameRunning) return;

    if (targets.length < maxTargets) {
        generateTarget();
    }

    drawTargets();
    updateScoreBoard();

    if (timeRemaining <= 0) {
        endGame();
    }
}

// 遊戲倒數計時
function countdown() {
    if (timeRemaining > 0) {
        timeRemaining--;
    } else {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
    }
}

// 遊戲結束處理
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    const modal = document.getElementById("endModal");
    const endMessage = document.getElementById("endMessage");
    endMessage.textContent = `遊戲結束！你的分數是 ${score}`;
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
    score = 0;
    timeRemaining = 300;
    isGameRunning = true;
    targets.length = 0; // 清空目標陣列
    updateScoreBoard();
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
    timerInterval = setInterval(countdown, 1000); // 每秒減少時間
}

// 滑鼠點擊事件
canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    checkHit(mouseX, mouseY);
});

// 初始化遊戲
function initGame() {
    const modal = document.getElementById("endModal");
    modal.style.display = "none"; // 確保靜態框隱藏
    updateScoreBoard();
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
    timerInterval = setInterval(countdown, 1000); // 每秒倒數
}

// 啟動遊戲
initGame();
