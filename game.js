const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let gameState = "select";
let selectedCharacter = null;

const gravity = 0.8;
const ground = 400;

class Fighter {
  constructor(x, color, stats) {
    this.x = x;
    this.y = ground;
    this.width = 40;
    this.height = 80;
    this.color = color;

    this.health = 100;
    this.velX = 0;
    this.velY = 0;
    this.speed = stats.speed;
    this.jumpPower = stats.jump;
    this.knockbackPower = stats.knockback;
    this.specialCooldown = false;

    this.onGround = true;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
  }

  update() {
    this.velY += gravity;
    this.y += this.velY;
    this.x += this.velX;

    if (this.y > ground) {
      this.y = ground;
      this.velY = 0;
      this.onGround = true;
    }

    if (this.x < 0) this.x = 0;
    if (this.x > canvas.width - this.width)
      this.x = canvas.width - this.width;
  }

  jump() {
    if (this.onGround) {
      this.velY = -this.jumpPower;
      this.onGround = false;
    }
  }

  attack(opponent) {
    if (Math.abs(this.x - opponent.x) < 60 &&
        Math.abs(this.y - opponent.y) < 80) {
      opponent.health -= 5;
      opponent.velX = (opponent.x > this.x ? 1 : -1) * this.knockbackPower;
    }
  }

  special(opponent) {
    if (this.specialCooldown) return;

    if (Math.abs(this.x - opponent.x) < 120) {
      opponent.health -= 15;
      opponent.velX = (opponent.x > this.x ? 1 : -1) * (this.knockbackPower * 2);
    }

    this.specialCooldown = true;
    setTimeout(() => this.specialCooldown = false, 2000);
  }
}

const characters = {
  Blaze: { color: "red", speed: 6, jump: 15, knockback: 8 },
  Volt: { color: "cyan", speed: 4, jump: 12, knockback: 14 }
};

let player1, player2;

let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (gameState === "select") {
    if (e.key === "1") startGame("Blaze");
    if (e.key === "2") startGame("Volt");
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function startGame(characterName) {
  selectedCharacter = characters[characterName];

  player1 = new Fighter(100, selectedCharacter.color, selectedCharacter);
  player2 = new Fighter(700, "blue", characters["Volt"]);

  gameState = "game";
}

function aiLogic() {
  if (player2.x > player1.x) player2.velX = -2;
  else player2.velX = 2;

  if (Math.random() < 0.02) player2.attack(player1);
  if (Math.random() < 0.005) player2.special(player1);
}

function drawHealthBars() {
  ctx.fillStyle = "green";
  ctx.fillRect(20, 20, player1.health * 2, 20);

  ctx.fillRect(500, 20, player2.health * 2, 20);
}

function drawSelectScreen() {
  ctx.fillStyle = "white";
  ctx.font = "30px monospace";
  ctx.fillText("Choose Your Fighter", 250, 150);

  ctx.fillText("Press 1 - Blaze (Fast)", 250, 250);
  ctx.fillText("Press 2 - Volt (Strong)", 250, 300);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "select") {
    drawSelectScreen();
    requestAnimationFrame(update);
    return;
  }

  player1.velX = 0;
  player2.velX = 0;

  if (keys["a"]) player1.velX = -player1.speed;
  if (keys["d"]) player1.velX = player1.speed;
  if (keys[" "]) player1.jump();
  if (keys["w"]) player1.attack(player2);
  if (keys["s"]) player1.special(player2);

  aiLogic();

  player1.update();
  player2.update();

  player1.draw();
  player2.draw();

  drawHealthBars();

  requestAnimationFrame(update);
}

update();
