const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let gameMode = "ai";

function setMode(mode){
  gameMode = mode;
}

class Fighter {
  constructor(x, color){
    this.x = x;
    this.y = 350;
    this.width = 40;
    this.height = 80;
    this.color = color;
    this.health = 100;
    this.velX = 0;
    this.speed = 5;
    this.isAttacking = false;
  }

  draw(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    if(this.isAttacking){
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x + this.width, this.y+20, 20, 20);
    }
  }

  update(){
    this.x += this.velX;

    if(this.x < 0) this.x = 0;
    if(this.x > canvas.width - this.width) this.x = canvas.width - this.width;
  }

  attack(opponent){
    this.isAttacking = true;

    if(Math.abs(this.x - opponent.x) < 60){
      opponent.health -= 5;
    }

    setTimeout(()=> this.isAttacking = false, 200);
  }
}

let player1 = new Fighter(100, "red");
let player2 = new Fighter(700, "blue");

let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function aiLogic(){
  if(player2.x > player1.x){
    player2.velX = -2;
  } else {
    player2.velX = 2;
  }

  if(Math.random() < 0.02){
    player2.attack(player1);
  }
}

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  player1.velX = 0;
  player2.velX = 0;

  if(keys["a"]) player1.velX = -player1.speed;
  if(keys["d"]) player1.velX = player1.speed;
  if(keys["w"]) player1.attack(player2);

  if(gameMode === "local"){
    if(keys["ArrowLeft"]) player2.velX = -player2.speed;
    if(keys["ArrowRight"]) player2.velX = player2.speed;
    if(keys["ArrowUp"]) player2.attack(player1);
  }

  if(gameMode === "ai"){
    aiLogic();
  }

  player1.update();
  player2.update();

  player1.draw();
  player2.draw();

  drawHealthBars();

  requestAnimationFrame(update);
}

function drawHealthBars(){
  ctx.fillStyle = "green";
  ctx.fillRect(20, 20, player1.health*2, 20);

  ctx.fillStyle = "green";
  ctx.fillRect(500, 20, player2.health*2, 20);
}

update();
