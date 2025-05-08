const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const bullets = document.getElementById("bullets");
const enemyBullets = document.getElementById("enemy-bullets");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const pauseBtn = document.getElementById("pause-btn");
const pauseMenu = document.getElementById("pause-menu");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const levelDisplay = document.getElementById("level");

let left = false, right = false, shoot = false;
let playerSpeed = 10;
let bulletSpeed = 8;
let enemyBulletSpeed = 5;
let gameRunning = true;
let lastTime = 0;
let score = 0;
let lives = 3;
let timeElapsed = 0;
let enemyDirection = 1;
let enemySpeed = 0.5;
let enemyRows = 3;
let enemyCols = 5;
let enemyShootInterval = 2000;
let lastEnemyShot = 0;
let lastPlayerShot = 0;
let playerShootCooldown = 250; // Cooldown between shots in milliseconds
let frameCount = 0;
let lastFPSUpdate = 0;
let fps = 0;
let currentLevel = 1;

// Input Handling
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
  if (e.key === " " || e.key === "ArrowUp") shoot = true;
  if (e.key.toLowerCase() === "p") {
    gameRunning = !gameRunning;
    pauseMenu.style.display = gameRunning ? "none" : "flex";
    pauseMenu.classList.toggle("hidden");
    if (gameRunning) {
      requestAnimationFrame(gameLoop);
    }
  }
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

  // Improved shooting mechanics
  const currentTime = performance.now();
  if (shoot && currentTime - lastPlayerShot > playerShootCooldown) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${player.offsetLeft + 17}px`;
    bullet.style.top = `${player.offsetTop - 10}px`;
    bullets.appendChild(bullet);
    lastPlayerShot = currentTime;
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

function showLevelCompleteMenu() {
  const levelMenu = document.createElement("div");
  levelMenu.id = "level-menu";
  levelMenu.innerHTML = `
    <h2>Level ${currentLevel} Complete!</h2>
    <p>Score: ${score}</p>
    <p>Time: ${Math.floor(timeElapsed)}s</p>
    <div class="level-buttons">
      <button id="next-level-btn">Proceed to Level ${currentLevel + 1}</button>
      <button id="restart-level-btn">Restart Level</button>
    </div>
  `;
  document.getElementById("game-container").appendChild(levelMenu);
  
  document.getElementById("next-level-btn").addEventListener("click", () => {
    levelMenu.remove();
    startNextLevel();
  });
  
  document.getElementById("restart-level-btn").addEventListener("click", () => {
    levelMenu.remove();
    restartLevel();
  });
}

function startNextLevel() {
  currentLevel++;
  levelDisplay.textContent = currentLevel;
  
  // Increase difficulty
  enemyBulletSpeed += 2;
  enemyShootInterval = Math.max(500, enemyShootInterval - 200); // Decrease interval but not below 500ms
  enemySpeed += 0.2;
  
  // Reset game state for new level
  enemies.innerHTML = "";
  bullets.innerHTML = "";
  enemyBullets.innerHTML = "";
  player.style.left = "180px";
  enemyDirection = 1;
  
  // Create new enemies
  createEnemies();
  gameRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function restartLevel() {
  // Reset game state for current level
  enemies.innerHTML = "";
  bullets.innerHTML = "";
  enemyBullets.innerHTML = "";
  player.style.left = "180px";
  enemyDirection = 1;
  
  // Create new enemies
  createEnemies();
  gameRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function updateBullets() {
  const bulletsToRemove = [];
  Array.from(bullets.children).forEach(bullet => {
    bullet.style.top = `${bullet.offsetTop - bulletSpeed}px`;
    if (bullet.offsetTop < 0) {
      bulletsToRemove.push(bullet);
      return;
    }

    Array.from(enemies.children).forEach(enemy => {
      if (checkCollision(bullet, enemy)) {
        bulletsToRemove.push(bullet);
        enemy.remove();
        score += 10;
        scoreDisplay.textContent = score;
        
        // Check if all enemies are destroyed
        if (enemies.children.length === 0) {
          gameRunning = false;
          timerDisplay.textContent = Math.floor(timeElapsed);
          
          setTimeout(() => {
            showLevelCompleteMenu();
          }, 500);
        }
      }
    });
  });

  // Remove bullets in a batch
  bulletsToRemove.forEach(bullet => bullet.remove());
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

  // Enemy shooting logic
  const currentTime = performance.now();
  if (currentTime - lastEnemyShot > enemyShootInterval && enemies.children.length > 0) {
    // Select a random enemy to shoot
    const randomEnemy = enemies.children[Math.floor(Math.random() * enemies.children.length)];
    const enemyBullet = document.createElement("div");
    enemyBullet.classList.add("enemy-bullet");
    enemyBullet.style.left = `${randomEnemy.offsetLeft + 15}px`; // Center the bullet
    enemyBullet.style.top = `${randomEnemy.offsetTop + 20}px`;
    enemyBullets.appendChild(enemyBullet);
    lastEnemyShot = currentTime;
  }
}

function updateEnemyBullets() {
  const bulletsToRemove = [];
  Array.from(enemyBullets.children).forEach(bullet => {
    bullet.style.top = `${bullet.offsetTop + enemyBulletSpeed}px`;
    
    if (bullet.offsetTop > 600) {
      bulletsToRemove.push(bullet);
      return;
    }

    if (checkCollision(bullet, player)) {
      bulletsToRemove.push(bullet);
      loseLife();
    }
  });

  // Remove bullets in a batch
  bulletsToRemove.forEach(bullet => bullet.remove());
}

function showGameOverMenu() {
  const gameOverMenu = document.createElement("div");
  gameOverMenu.id = "game-over-menu";
  gameOverMenu.innerHTML = `
    <h2>Game Over!</h2>
    <p>Final Score: ${score}</p>
    <p>Level Reached: ${currentLevel}</p>
    <p>Time Survived: ${Math.floor(timeElapsed)}s</p>
    <div class="game-over-buttons">
      <button id="play-again-btn">Start Over</button>
    </div>
  `;
  document.getElementById("game-container").appendChild(gameOverMenu);
  
  document.getElementById("play-again-btn").addEventListener("click", () => {
    location.reload();
  });
}

function loseLife() {
  if (!gameRunning) return; // Prevent multiple lose events
  
  lives--;
  livesDisplay.textContent = lives;
  gameRunning = false;
  
  if (lives <= 0) {
    // Clear any existing menus
    const existingMenu = document.getElementById("lose-menu");
    if (existingMenu) {
      existingMenu.remove();
    }
    
    setTimeout(() => {
      showGameOverMenu();
    }, 500);
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

function updateFPS(timestamp) {
  frameCount++;
  if (timestamp - lastFPSUpdate >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFPSUpdate = timestamp;
  }
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  // Calculate delta time in seconds
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Update FPS counter
  updateFPS(timestamp);

  // Update game state
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateEnemyBullets();
  updateTimer(dt * 1000); // Convert back to milliseconds for timer

  // Use requestAnimationFrame with timestamp
  requestAnimationFrame(gameLoop);
}

// Initialize game
createEnemies();
lastTime = performance.now();
requestAnimationFrame(gameLoop);
