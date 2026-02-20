const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const modeButtons = document.querySelectorAll("button[data-mode]");

const GROUND_Y = canvas.height - 64;
const keys = {};

let bgPulse = 0;
let bgDirection = 1;
let mode = "ai";
let gameState = "title";
let menuIndex = 0;
let charIndex = 0;

const menuOptions = ["Start Game", "Controls", "Credits"];

const controlsText = [
  "P1: A/D move, W jump, F attack",
  "P2: ←/→ move, ↑ jump, / attack",
  "Switch mode using top-left buttons"
];

const characters = [
  { name: "Blaze", color: "#ff5c63", speed: 5.8, jump: 14.5, knockback: 10 },
  { name: "Volt", color: "#33d9ff", speed: 4.8, jump: 13, knockback: 14 },
  { name: "Stone", color: "#8de284", speed: 4.2, jump: 12, knockback: 16 }
];

const fighters = [
  createFighter(120, "#ff5c63", {
    left: "a",
    right: "d",
    jump: "w",
    attack: "f"
  }),
  createFighter(820, "#33d9ff", {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "ArrowUp",
    attack: "/"
  })
];

function createFighter(x, color, controls) {
  return {
    x,
    y: GROUND_Y,
    width: 38,
    height: 78,
    vx: 0,
    vy: 0,
    color,
    controls,
    facing: 1,
    onGround: true,
    hp: 100,
    attackCooldown: 0,
    attackTimer: 0,
    hitFlash: 0,
    wins: 0,
    character: characters[0]
  };
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  setStatus(mode === "ai" ? "Mode: VS AI" : "Mode: Local 2P");
}
window.setMode = setMode;
setMode("ai");

function resetRound() {
  fighters[0].x = 120;
  fighters[1].x = 820;
  fighters.forEach((fighter, i) => {
    fighter.y = GROUND_Y;
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.onGround = true;
    fighter.hp = 100;
    fighter.attackCooldown = 0;
    fighter.attackTimer = 0;
    fighter.hitFlash = 0;
    fighter.facing = i === 0 ? 1 : -1;
  });
}

function startGame() {
  gameState = "fight";
  const selected = characters[charIndex];
  fighters[0].character = selected;
  fighters[0].color = selected.color;

  if (mode === "ai") {
    const randomOpponent = characters[(charIndex + 1 + Math.floor(Math.random() * (characters.length - 1))) % characters.length];
    fighters[1].character = randomOpponent;
    fighters[1].color = randomOpponent.color;
  } else {
    fighters[1].character = characters[(charIndex + 1) % characters.length];
    fighters[1].color = fighters[1].character.color;
  }

  resetRound();
  setStatus("Fight! First to deplete HP wins the round.");
}

document.addEventListener("keydown", (e) => {
  if (!keys[e.key]) handleInput(e.key);
  keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function handleInput(key) {
  if (gameState === "title") {
    gameState = "mainMenu";
    setStatus("Use ↑/↓ + Enter to navigate menus");
    return;
  }

  if (gameState === "mainMenu") {
    if (key === "ArrowUp") menuIndex--;
    if (key === "ArrowDown") menuIndex++;
    if (key === "Enter") {
      if (menuOptions[menuIndex] === "Start Game") gameState = "characterSelect";
      if (menuOptions[menuIndex] === "Controls") setStatus(controlsText.join(" • "));
      if (menuOptions[menuIndex] === "Credits") setStatus("Made better with smoother combat, UI polish, and AI behavior.");
    }
    if (menuIndex < 0) menuIndex = menuOptions.length - 1;
    if (menuIndex >= menuOptions.length) menuIndex = 0;
  } else if (gameState === "characterSelect") {
    if (key === "ArrowLeft") charIndex--;
    if (key === "ArrowRight") charIndex++;
    if (key === "Enter") startGame();
    if (charIndex < 0) charIndex = characters.length - 1;
    if (charIndex >= characters.length) charIndex = 0;
  } else if (gameState === "fight") {
    if (key === "Escape") {
      gameState = "mainMenu";
      setStatus("Paused. Back at menu.");
    }
  } else if (gameState === "gameOver" && key === "Enter") {
    gameState = "mainMenu";
    setStatus("Choose Start Game to fight again.");
  }
}

function drawBackground() {
  bgPulse += 0.008 * bgDirection;
  if (bgPulse > 1 || bgPulse < 0) bgDirection *= -1;

  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 120, canvas.width / 2, canvas.height / 2, 620);
  gradient.addColorStop(0, `rgba(36, 54, 100, ${0.38 + bgPulse * 0.2})`);
  gradient.addColorStop(1, "rgba(7, 10, 20, 1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.fillRect(x, GROUND_Y + 58, 20, 2);
  }

  ctx.fillStyle = "#10192f";
  ctx.fillRect(0, GROUND_Y + 14, canvas.width, 65);
}

function drawTitle() {
  ctx.textAlign = "center";
  ctx.fillStyle = "#f6f8ff";
  ctx.font = "bold 62px monospace";
  ctx.fillText("PIXEL FIGHTERS", canvas.width / 2, 170);

  ctx.fillStyle = "#ffd166";
  ctx.font = "24px monospace";
  ctx.fillText("Arcade Remix", canvas.width / 2, 215);

  ctx.fillStyle = "#dce4ff";
  ctx.font = "20px monospace";
  ctx.fillText("Press Any Key", canvas.width / 2, 310);
  ctx.textAlign = "left";
}

function drawMainMenu() {
  ctx.fillStyle = "#f6f8ff";
  ctx.font = "46px monospace";
  ctx.fillText("MAIN MENU", 330, 120);

  ctx.font = "29px monospace";
  menuOptions.forEach((option, i) => {
    ctx.fillStyle = i === menuIndex ? "#ffd166" : "#ffffff";
    ctx.fillText(`${i === menuIndex ? ">" : " "} ${option}`, 390, 210 + i * 56);
  });
}

function drawCharacterSelect() {
  ctx.fillStyle = "white";
  ctx.font = "40px monospace";
  ctx.fillText("SELECT YOUR FIGHTER", 220, 96);

  characters.forEach((char, i) => {
    const x = 170 + i * 260;
    const isSelected = i === charIndex;

    ctx.fillStyle = isSelected ? "#ffd166" : "#dce4ff";
    ctx.font = "26px monospace";
    ctx.fillText(char.name, x, 170);

    ctx.fillStyle = char.color;
    ctx.fillRect(x + 20, 205, 90, 135);

    if (isSelected) {
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 10, 195, 110, 155);
    }

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`Speed: ${char.speed}`, x - 4, 385);
    ctx.fillText(`Jump: ${char.jump}`, x - 4, 410);
    ctx.fillText(`Power: ${char.knockback}`, x - 4, 435);
  });

  ctx.fillStyle = "#dce4ff";
  ctx.font = "18px monospace";
  ctx.fillText("Use ←/→ and Enter", 390, 470);
}

function drawHUD() {
  fighters.forEach((fighter, i) => {
    const barX = i === 0 ? 20 : canvas.width - 320;
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(barX, 16, 300, 22);

    ctx.fillStyle = fighter.hp > 35 ? "#58e07d" : "#ff7a7a";
    ctx.fillRect(barX + 2, 18, Math.max(0, (fighter.hp / 100) * 296), 18);

    ctx.fillStyle = "#f3f8ff";
    ctx.font = "16px monospace";
    ctx.fillText(`${i === 0 ? "P1" : "P2"} ${fighter.character.name}`, barX, 54);
  });
}

function applyMovement(fighter, stats, leftPressed, rightPressed, jumpPressed) {
  const moveSpeed = stats.speed;
  fighter.vx = 0;
  if (leftPressed) fighter.vx -= moveSpeed;
  if (rightPressed) fighter.vx += moveSpeed;
  if (fighter.vx !== 0) fighter.facing = Math.sign(fighter.vx);

  if (jumpPressed && fighter.onGround) {
    fighter.vy = -stats.jump;
    fighter.onGround = false;
  }
}

function attack(attacker, defender) {
  if (attacker.attackCooldown > 0) return;
  attacker.attackCooldown = 32;
  attacker.attackTimer = 8;

  const range = 56;
  const facingOk = attacker.facing > 0 ? defender.x > attacker.x : defender.x < attacker.x;
  const closeEnough = Math.abs(defender.x - attacker.x) < range;
  const overlapY = Math.abs(defender.y - attacker.y) < 52;

  if (facingOk && closeEnough && overlapY) {
    defender.hp -= 8 + attacker.character.knockback * 0.35;
    defender.vx += attacker.facing * (attacker.character.knockback * 0.8);
    defender.vy = -5;
    defender.hitFlash = 8;
  }
}

function aiControl() {
  const ai = fighters[1];
  const player = fighters[0];
  const gap = player.x - ai.x;

  if (Math.abs(gap) > 56) {
    ai.vx = Math.sign(gap) * ai.character.speed * 0.9;
    ai.facing = Math.sign(gap);
  } else {
    ai.vx = 0;
    ai.facing = gap >= 0 ? 1 : -1;
    if (Math.random() < 0.08) attack(ai, player);
  }

  if (Math.random() < 0.015 && ai.onGround) {
    ai.vy = -ai.character.jump;
    ai.onGround = false;
  }
}

function updateFighterPhysics(fighter) {
  fighter.vy += 0.65;
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  if (fighter.x < 0) fighter.x = 0;
  if (fighter.x > canvas.width - fighter.width) fighter.x = canvas.width - fighter.width;

  if (fighter.y >= GROUND_Y) {
    fighter.y = GROUND_Y;
    fighter.vy = 0;
    fighter.onGround = true;
  }

  fighter.attackCooldown = Math.max(0, fighter.attackCooldown - 1);
  fighter.attackTimer = Math.max(0, fighter.attackTimer - 1);
  fighter.hitFlash = Math.max(0, fighter.hitFlash - 1);
}

function drawFighter(fighter) {
  ctx.fillStyle = fighter.hitFlash ? "#ffffff" : fighter.color;
  ctx.fillRect(fighter.x, fighter.y - fighter.height, fighter.width, fighter.height);

  ctx.fillStyle = "#0c1020";
  const eyeX = fighter.facing > 0 ? fighter.x + fighter.width - 12 : fighter.x + 6;
  ctx.fillRect(eyeX, fighter.y - fighter.height + 16, 6, 6);

  if (fighter.attackTimer > 0) {
    ctx.fillStyle = "rgba(255, 230, 130, 0.8)";
    const handX = fighter.facing > 0 ? fighter.x + fighter.width : fighter.x - 16;
    ctx.fillRect(handX, fighter.y - fighter.height + 30, 16, 8);
  }
}

function updateFight() {
  const p1 = fighters[0];
  const p2 = fighters[1];

  applyMovement(
    p1,
    p1.character,
    keys[p1.controls.left],
    keys[p1.controls.right],
    keys[p1.controls.jump]
  );

  if (mode === "local") {
    applyMovement(
      p2,
      p2.character,
      keys[p2.controls.left],
      keys[p2.controls.right],
      keys[p2.controls.jump]
    );
  } else {
    aiControl();
  }

  if (keys[p1.controls.attack]) attack(p1, p2);
  if (mode === "local" && keys[p2.controls.attack]) attack(p2, p1);

  updateFighterPhysics(p1);
  updateFighterPhysics(p2);

  if (p1.hp <= 0 || p2.hp <= 0) {
    const winner = p1.hp > p2.hp ? "P1" : mode === "ai" ? "AI" : "P2";
    gameState = "gameOver";
    setStatus(`${winner} wins! Press Enter for menu.`);
  }
}

function drawFight() {
  drawHUD();
  drawFighter(fighters[0]);
  drawFighter(fighters[1]);

  ctx.fillStyle = "#9fb1de";
  ctx.font = "15px monospace";
  ctx.fillText("Esc: menu", canvas.width - 115, canvas.height - 20);
}

function drawGameOver() {
  drawFight();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 60px monospace";
  ctx.fillText("ROUND OVER", 310, 225);

  ctx.fillStyle = "#ffffff";
  ctx.font = "22px monospace";
  ctx.fillText("Press Enter to return to menu", 295, 275);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (gameState === "title") drawTitle();
  else if (gameState === "mainMenu") drawMainMenu();
  else if (gameState === "characterSelect") drawCharacterSelect();
  else if (gameState === "fight") {
    updateFight();
    drawFight();
  } else if (gameState === "gameOver") drawGameOver();

  requestAnimationFrame(update);
}

update();
