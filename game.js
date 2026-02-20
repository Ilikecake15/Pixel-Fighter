const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 500;

let gameState = "title";
let menuIndex = 0;
let charIndex = 0;

const menuOptions = [
  "Start Game",
  "Options",
  "Credits"
];

const characters = [
  {name:"Blaze", color:"red", speed:6, jump:15, knockback:8},
  {name:"Volt", color:"cyan", speed:4, jump:13, knockback:15}
];

let keys = {};

document.addEventListener("keydown", e=>{
  if(!keys[e.key]){
    handleInput(e.key);
  }
  keys[e.key]=true;
});
document.addEventListener("keyup", e=> keys[e.key]=false);

function handleInput(key){

  if(gameState==="title"){
    gameState="mainMenu";
  }

  else if(gameState==="mainMenu"){
    if(key==="ArrowUp") menuIndex--;
    if(key==="ArrowDown") menuIndex++;
    if(key==="Enter"){
      if(menuOptions[menuIndex]==="Start Game"){
        gameState="characterSelect";
      }
    }

    if(menuIndex<0) menuIndex=menuOptions.length-1;
    if(menuIndex>=menuOptions.length) menuIndex=0;
  }

  else if(gameState==="characterSelect"){
    if(key==="ArrowLeft") charIndex--;
    if(key==="ArrowRight") charIndex++;
    if(key==="Enter"){
      startGame();
    }

    if(charIndex<0) charIndex=characters.length-1;
    if(charIndex>=characters.length) charIndex=0;
  }

  else if(gameState==="gameOver"){
    if(key==="Enter"){
      gameState="mainMenu";
    }
  }
}

function drawTitle(){
  ctx.fillStyle="white";
  ctx.font="60px monospace";
  ctx.fillText("PIXEL FIGHTERS",250,200);

  ctx.font="20px monospace";
  ctx.fillText("Press Any Key",400,300);
}

function drawMainMenu(){
  ctx.fillStyle="white";
  ctx.font="40px monospace";
  ctx.fillText("MAIN MENU",350,120);

  ctx.font="28px monospace";

  menuOptions.forEach((option,i)=>{
    if(i===menuIndex){
      ctx.fillStyle="yellow";
    } else {
      ctx.fillStyle="white";
    }
    ctx.fillText(option,420,200+i*50);
  });
}

function drawCharacterSelect(){
  ctx.fillStyle="white";
  ctx.font="40px monospace";
  ctx.fillText("SELECT YOUR FIGHTER",250,100);

  characters.forEach((char,i)=>{
    let x = 300 + i*300;

    ctx.fillStyle = i===charIndex ? "yellow" : "white";
    ctx.fillText(char.name,x,200);

    ctx.fillStyle = char.color;
    ctx.fillRect(x+30,250,100,150);

    ctx.fillStyle="white";
    ctx.font="16px monospace";
    ctx.fillText("Speed: "+char.speed,x,420);
    ctx.fillText("Jump: "+char.jump,x,440);
    ctx.fillText("Power: "+char.knockback,x,460);
  });
}

function startGame(){
  gameState="fight";
}

function drawFightPlaceholder(){
  ctx.fillStyle="white";
  ctx.font="30px monospace";
  ctx.fillText("FIGHT STARTING...",350,250);
}

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(gameState==="title") drawTitle();
  else if(gameState==="mainMenu") drawMainMenu();
  else if(gameState==="characterSelect") drawCharacterSelect();
  else if(gameState==="fight") drawFightPlaceholder();

  requestAnimationFrame(update);
}

update();
