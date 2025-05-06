const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const bullets = document.getElementById("bullets");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const pauseBtn = document.getElementById("pause-btn");
const pauseMenu = document.getElementById("pause-menu");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");

let left = false, right = false, shoot = false;
let playerSpeed = 5;
let bulletSpeed = 7;
let gameRunning = true;
let lastTime = 0;
let score = 0;
let lives = 3;
let timeElapsed = 0;
let enemyDirection = 1;
let enemySpeed = 0.5;
let enemyRows = 3;
let enemyCols = 5;

// Input Handling
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
  if (e.key === " " || e.key === "ArrowUp") shoot = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
  if (e.key === " " || e.key === "ArrowUp") shoot = false;
});

// Pause Menu
pauseBtn.addEventListener("click", () => {
  gameRunning = !gameRunning;
  pauseMenu.style.display = gameRunning ? "none" : "flex";
  pauseMenu.classList.toggle("hidden");
  if (gameRunning) {
    requestAnimationFrame(gameLoop);
  }
});

resumeBtn.addEventListener("click", () => {
  gameRunning = true;
  pauseMenu.classList.add("hidden");
  requestAnimationFrame(gameLoop);
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

//  creates a block
function createEnemies() {
  enemies.innerHTML = "";
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
      const enemy = document.createElement("div");
      enemy.classList.add("enemy");
      enemy.style.top = `${row * 40}px`;
      enemy.style.left = `${col * 60}px`;
      enemies.appendChild(enemy);
    }
  }
}

function updatePlayer() {
  let pos = player.offsetLeft;
  if (left && pos > 0) pos -= playerSpeed;
  if (right && pos < 360) pos += playerSpeed;
  player.style.left = `${pos}px`;

  if (shoot && bullets.children.length < 1) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${player.offsetLeft + 17}px`;
    bullet.style.top = `${player.offsetTop - 10}px`;
    bullets.appendChild(bullet);
  }
}

function updateBullets() {
  Array.from(bullets.children).forEach(bullet => {
    bullet.style.top = `${bullet.offsetTop - bulletSpeed}px`;
    if (bullet.offsetTop < 0) bullet.remove();

    Array.from(enemies.children).forEach(enemy => {
      if (checkCollision(bullet, enemy)) {
        bullet.remove();
        enemy.remove();
        score += 10;
        scoreDisplay.textContent = score;
      }
    });
  });
}

function updateEnemies() {
  let hitEdge = false;
  Array.from(enemies.children).forEach(enemy => {
    enemy.style.left = `${enemy.offsetLeft + enemyDirection}px`;
    if (enemy.offsetLeft <= 0 || enemy.offsetLeft + 30 >= 400) hitEdge = true;
  });

  if (hitEdge) {
    enemyDirection *= -1;
    Array.from(enemies.children).forEach(enemy => {
      enemy.style.top = `${enemy.offsetTop + 10}px`;
      if (enemy.offsetTop + 20 >= 580) {
        loseLife();
      }
    });
  }
}

function loseLife() {
  lives--;
  livesDisplay.textContent = lives;
  if (lives <= 0) {
    alert("Game Over!");
    location.reload();
  }
}

function checkCollision(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function updateTimer(dt) {
  timeElapsed += dt / 1000;
  timerDisplay.textContent = Math.floor(timeElapsed);
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  updatePlayer();
  updateBullets();
  updateEnemies();
  updateTimer(dt);

  requestAnimationFrame(gameLoop);
}

createEnemies();
requestAnimationFrame(gameLoop);
