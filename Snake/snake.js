const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const boxSize = 20; // 每格大小
const canvasSize = canvas.width / boxSize;


let snake = [{ x: 5, y: 5 }]; // 初始貪食蛇位置
let direction = "null"; // 初始方向
let food = { x: Math.floor(Math.random() * canvasSize), y: Math.floor(Math.random() * canvasSize) };
let score = 0;
let speed = 300;

// 更新記分板
function updateScore() {
    document.getElementById("scoreBoard").innerHTML = `Score: ${score}`;
}
// 控制貪食蛇方向
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    else if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// 隨機生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * canvasSize),
        y: Math.floor(Math.random() * canvasSize),
    };

    // 確保食物不會生成在貪食蛇身上
    snake.forEach((segment) => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

// 繪製遊戲
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製貪食蛇
    ctx.fillStyle = "green";
    snake.forEach((segment) => {
        ctx.fillRect(segment.x * boxSize, segment.y * boxSize, boxSize, boxSize);
    });

    // 繪製食物
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * boxSize, food.y * boxSize, boxSize, boxSize);
}

// 更新遊戲邏輯
function updateGame() {
    // 計算貪食蛇的新頭部位置
    let head = { ...snake[0] };
    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // 碰撞檢測：檢查牆壁
    if (head.x < 0 || head.y < 0 || head.x >= canvasSize || head.y >= canvasSize) {
        gameOver();
        return;
    }

    // 碰撞檢測：檢查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // 檢查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        speed += 10;
        updateScore();
        generateFood(); // 生成新的食物
    } else {
        snake.pop(); // 移除尾部
    }

    // 增加新頭部
    snake.unshift(head);
    drawGame();
}

// 遊戲結束
function gameOver() {
    clearInterval(game);
    alert("遊戲結束！重新開始？");
    window.location.href = '/game.html'; //跳回主頁面
}

// 重置遊戲
function resetGame() {
    snake = [{ x: 5, y: 5 }];
    direction = "RIGHT";
    score = 0;
    updateScore();
    generateFood();
    game = setInterval(updateGame, speed);
}

// 開始遊戲
let game = setInterval(updateGame, speed);