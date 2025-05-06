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
let playerSpeed = 10;
let bulletSpeed = 8;
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
  const startY = 50; // Position after scoreboard title bar
  const enemyWidth = 30;
  const enemyHeight = 20;
  const spacingX = 60;
  const spacingY = 40;
  
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
      const enemy = document.createElement("div");
      enemy.classList.add("enemy");
      enemy.style.position = "absolute";
      enemy.style.width = `${enemyWidth}px`;
      enemy.style.height = `${enemyHeight}px`;
      enemy.style.top = `${startY + (row * spacingY)}px`;
      enemy.style.left = `${col * spacingX}px`;
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

function showWinMenu() {
  const winMenu = document.createElement("div");
  winMenu.id = "win-menu";
  winMenu.innerHTML = `
    <h2>You Won!</h2>
    <p>Time: ${Math.floor(timeElapsed)}s</p>
    <p>Score: ${score}</p>
    <button id="play-again-btn">Play Again</button>
  `;
  document.getElementById("game-container").appendChild(winMenu);
  
  document.getElementById("play-again-btn").addEventListener("click", () => {
    location.reload();
  });
}

function showLoseMenu() {
  const loseMenu = document.createElement("div");
  loseMenu.id = "lose-menu";
  loseMenu.innerHTML = `
    <h2>You Lost a Life!</h2>
    <p>Lives remaining: ${lives}</p>
    <div class="lose-buttons">
      <button id="continue-btn">Continue (${lives} lives)</button>
      <button id="restart-lose-btn">Restart Game</button>
    </div>
  `;
  document.getElementById("game-container").appendChild(loseMenu);
  
  document.getElementById("continue-btn").addEventListener("click", () => {
    loseMenu.remove();
    // Reset game state
    enemies.innerHTML = "";
    bullets.innerHTML = "";
    player.style.left = "180px";
    // Reset enemy movement variables
    enemyDirection = 1;
    createEnemies();
    gameRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  });
  
  document.getElementById("restart-lose-btn").addEventListener("click", () => {
    location.reload();
  });
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
        
        // Check if all enemies are destroyed
        if (enemies.children.length === 0) {
          gameRunning = false;
          timerDisplay.textContent = Math.floor(timeElapsed);
          
          // Wait for 2 seconds before showing win message
          setTimeout(() => {
            showWinMenu();
          }, 500);
        }
      }
    });
  });
}

function updateEnemies() {
  let hitEdge = false;
  Array.from(enemies.children).forEach(enemy => {
    enemy.style.left = `${enemy.offsetLeft + enemyDirection}px`;
    if (enemy.offsetLeft <= 0 || enemy.offsetLeft + 30 >= 400) hitEdge = true;
    
    // Check if any enemy has reached the player's level
    if (enemy.offsetTop + 20 >= player.offsetTop - 30) {
      loseLife();
      return; // Exit the function to prevent further updates
    }
  });

  if (hitEdge) {
    enemyDirection *= -1;
    Array.from(enemies.children).forEach(enemy => {
      enemy.style.top = `${enemy.offsetTop + 10}px`;
    });
  }
}

function loseLife() {
  if (!gameRunning) return; // Prevent multiple lose events
  
  lives--;
  livesDisplay.textContent = lives;
  gameRunning = false;
  
  if (lives <= 0) {
    alert("Game Over!");
    location.reload();
  } else {
    // Clear any existing lose menu
    const existingMenu = document.getElementById("lose-menu");
    if (existingMenu) {
      existingMenu.remove();
    }
    
    setTimeout(() => {
      showLoseMenu();
    }, 500);
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
