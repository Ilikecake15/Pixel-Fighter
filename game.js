alert("NEW VERSION LOADED");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 500;

let gameState = "select";
let round = 1;
let maxRounds = 3;
let screenShake = 0;

const gravity = 0.8;
const ground = 420;

let sounds = {
  hit: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.wav"),
  special: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-changing-tab-206.wav")
};

class Particle {
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.life = 20;
  }
  draw(){
    ctx.fillStyle="orange";
    ctx.fillRect(this.x,this.y,4,4);
  }
  update(){
    this.y -=2;
    this.life--;
  }
}

class Projectile {
  constructor(x,y,dir){
    this.x=x;
    this.y=y;
    this.dir=dir;
    this.speed=10;
    this.size=15;
  }
  update(){
    this.x+=this.speed*this.dir;
  }
  draw(){
    ctx.fillStyle="yellow";
    ctx.fillRect(this.x,this.y,this.size,this.size);
  }
}

class Fighter{
  constructor(x,color,stats){
    this.x=x;
    this.y=ground;
    this.width=50;
    this.height=90;
    this.color=color;

    this.health=100;
    this.velX=0;
    this.velY=0;

    this.speed=stats.speed;
    this.jumpPower=stats.jump;
    this.knockback=stats.knockback;

    this.onGround=true;
    this.projectiles=[];
  }

  draw(){
    ctx.fillStyle=this.color;
    ctx.fillRect(this.x,this.y-this.height,this.width,this.height);
  }

  update(){
    this.velY+=gravity;
    this.y+=this.velY;
    this.x+=this.velX;

    if(this.y>ground){
      this.y=ground;
      this.velY=0;
      this.onGround=true;
    }

    if(this.x<0) this.x=0;
    if(this.x>canvas.width-this.width)
      this.x=canvas.width-this.width;

    this.projectiles.forEach(p=>p.update());
  }

  jump(){
    if(this.onGround){
      this.velY=-this.jumpPower;
      this.onGround=false;
    }
  }

  attack(opponent){
    if(Math.abs(this.x-opponent.x)<70){
      opponent.health-=8;
      opponent.velX=(opponent.x>this.x?1:-1)*this.knockback;
      screenShake=10;
      sounds.hit.play();
      createParticles(opponent.x,opponent.y);
    }
  }

  special(opponent){
    let dir = opponent.x>this.x?1:-1;
    this.projectiles.push(new Projectile(this.x+25,this.y-50,dir));
    sounds.special.play();
  }
}

const characters={
  Blaze:{color:"red",speed:6,jump:15,knockback:8},
  Volt:{color:"cyan",speed:4,jump:13,knockback:15}
};

let player1,player2;
let particles=[];
let keys={};

document.addEventListener("keydown",e=>{
  keys[e.key]=true;
  if(gameState==="select"){
    if(e.key==="1") startGame("Blaze");
    if(e.key==="2") startGame("Volt");
  }
});
document.addEventListener("keyup",e=>keys[e.key]=false);

function startGame(name){
  player1=new Fighter(150,characters[name].color,characters[name]);
  player2=new Fighter(800,"blue",characters["Volt"]);
  gameState="fight";
}

function aiLogic(){
  if(player2.x>player1.x) player2.velX=-2;
  else player2.velX=2;

  if(Math.random()<0.02) player2.attack(player1);
  if(Math.random()<0.01) player2.special(player1);
}

function createParticles(x,y){
  for(let i=0;i<10;i++){
    particles.push(new Particle(x+Math.random()*30,y-50));
  }
}

function checkProjectiles(){
  player1.projectiles.forEach(p=>{
    if(Math.abs(p.x-player2.x)<40){
      player2.health-=15;
      screenShake=15;
    }
  });

  player2.projectiles.forEach(p=>{
    if(Math.abs(p.x-player1.x)<40){
      player1.health-=15;
      screenShake=15;
    }
  });
}

function drawHealth(){
  ctx.fillStyle="green";
  ctx.fillRect(20,20,player1.health*3,20);
  ctx.fillRect(650,20,player2.health*3,20);
}

function drawSelect(){
  ctx.fillStyle="white";
  ctx.font="30px monospace";
  ctx.fillText("Press 1 - Blaze (Fast Fire)",300,200);
  ctx.fillText("Press 2 - Volt (Heavy Knockback)",300,260);
}

function checkWinner(){
  if(player1.health<=0 || player2.health<=0){
    gameState="roundOver";
    setTimeout(()=>{
      if(round<maxRounds){
        round++;
        startGame("Blaze");
      }else{
        gameState="gameOver";
      }
    },2000);
  }
}

function update(){
  ctx.save();

  if(screenShake>0){
    ctx.translate(Math.random()*10-5,Math.random()*10-5);
    screenShake--;
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(gameState==="select"){
    drawSelect();
    requestAnimationFrame(update);
    return;
  }

  if(gameState==="gameOver"){
    ctx.fillStyle="white";
    ctx.font="40px monospace";
    ctx.fillText("GAME OVER",400,250);
    return;
  }

  player1.velX=0;

  if(keys["a"]) player1.velX=-player1.speed;
  if(keys["d"]) player1.velX=player1.speed;
  if(keys[" "]) player1.jump();
  if(keys["w"]) player1.attack(player2);
  if(keys["s"]) player1.special(player2);

  aiLogic();

  player1.update();
  player2.update();

  checkProjectiles();
  checkWinner();

  player1.draw();
  player2.draw();

  player1.projectiles.forEach(p=>p.draw());
  player2.projectiles.forEach(p=>p.draw());

  particles.forEach(p=>{p.update();p.draw();});
  particles=particles.filter(p=>p.life>0);

  drawHealth();

  ctx.restore();
  requestAnimationFrame(update);
}

update();
