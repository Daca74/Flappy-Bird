// ---dimensions scène---
const wST = 500;
const hST = 700;

// ---référence textures---
let textures;

// référence éléments
let ground, pipe, bird, ready;
let rTop, rBot; // rectangles collision
let life = 5, tLife = [];

let angle = 0, amplitude = 60;
let vY = 0, acc = 1, impulsion = -7;
let etat = 0; // 0 = en jeu, 1 = mort
let phaseJeu = 0; // 0 = accueil, 1 = jeu, 2 = game over
let score = 0;

// ---étape 01 - crétion appli pixi ---
const app = new PIXI.Application(
  {
    width: wST,
    height: hST,
    backgroundColor: 0x33CCFF,
  }
)
// ---étape 02 - ajout de la vue de l'appli ---
document.body.appendChild(app.view);
// ---étape 03 - chargement des actifs externes ---
const loader = PIXI.Loader.shared;
// ajout des fichers à charger
loader.add('spriteSheet', 'assets/flappy_bird.json');
// lance le chargement
loader.load((loader, resources) => {
  // référence les textures
  textures = resources.spriteSheet.textures;
  // itialise les éléments graphiques
  init();
})

// écouteur clavier
window.addEventListener('keyup', function(e) {
  if (e.keyCode === 32) {
    phaseJeu = 1;
    vY = impulsion;
    if (etat === 1) {
      phaseJeu = 0;
    }
  }
})

// fonction d'innitialisation 
function init() {
  createBg();
  createPipe();
  createSol();
  createBird();
  createReady();
  createGo();
  createLifeb();

  // lancer la gameloop
  app.ticker.add(() => {
    // déplacer le sol
    ground.x -= 2;
    if (ground.x <= -120) { ground.x = 0 }

    // déplacer les tuyaux 
    pipe.x -= 2;
    if (phaseJeu === 0) {
      pipe.x = -100;
    } else { 
      if (pipe.x <= (0 - pipe.width/2)) {
      pipe.x = wST + pipe.width/2; 
      pipe.y = (hST - hST*0.3) + Math.random() * ((hST - hST*0.8) - (hST - hST*0.3));
    }}
    
    // déplacer l'oiseau
    if (phaseJeu === 0) {
      bird.y = hST * 0.5 + Math.sin(angle) * amplitude;
      angle += 0.09;  
      go.x = -wST;
      go.y = -hST;
    } else if (bird.y <= 0 || bird.y > hST - ground.height || collide(bird.getBounds(), rTop.getBounds()) || collide(bird.getBounds(), rBot.getBounds())) { // game over haut bas
      if (life === 0){
        go.x = wST/2;
        go.y = hST/2;
        etat = 1;
      } else {  
        life -= 1;
        bird.y = hST * 0.5;
        vY = 0;
        pipe.x = wST + pipe.width/2; 
        pipe.y = (hST - hST*0.3) + Math.random() * ((hST - hST*0.8) - (hST - hST*0.3));
        tLife[life].rotation -= 3;
        tLife[life].alpha = 0.5;
      }
      console.log(life);
    } else {
      bird.y += vY; //vitesse = vY
      vY = Math.min(10, vY + acc) //acc = acceleration
      go.x = -wST;
      go.y = -hST;
      bird.rotation = vY * 0.06;
    }

    // ready ou pas
    if (phaseJeu === 0) {
      ready.x = wST/2;
      ready.y = hST/2;
    } else {
      ready.x = -wST;
      ready.y = -hST;
    }
  });
}
// création de l'arrière plan
function createBg() {
  let bg = new PIXI.Sprite(textures['background.png']);
  //ajoute le sprite sur la scène
  app.stage.addChild(bg);
}
// création sol 
function createSol() {
  ground = new PIXI.Sprite(textures['ground.png']);
  //ajoute le sprite sur la scène
  app.stage.addChild(ground);
  ground.y = hST - ground.height;
}
// création des tuyaux
function createPipe() {
  pipe = new PIXI.Sprite(textures['pipe.png']);
  //ajoute le sprite sur la scène
  app.stage.addChild(pipe);
  pipe.anchor.set(0.5);

  // création rectangle collision
  rTop = new PIXI.Graphics();
  rTop.x = -46;
  rTop.y = -572;
  rTop.beginFill(0, 0);
  rTop.drawRect(0, 0, 91, 486);
  pipe.addChild(rTop);
  
  rBot = new PIXI.Graphics();
  rBot.x = -46;
  rBot.y = 86;
  rBot.beginFill(0, 0);
  rBot.drawRect(0, 0, 91, 486);
  pipe.addChild(rBot);
}
// création de l'oiseau et des vies
function createBird() {
  bird = new PIXI.AnimatedSprite(
    [
      textures['bird0.png'],
      textures['bird1.png'],
      textures['bird2.png'],
    ]
  )
  // ajoute le sprite sur la scène
  app.stage.addChild(bird);
  bird.x = wST * 0.3;
  bird.y = hST * 0.3;
  bird.anchor.set(0.5);
  // règle vitesse oiseau
  bird.animationSpeed = 0.25;
  // lance l'animation
  bird.play();
}
function createLifeb() {
  for(let i = 0 ; i < life ; i ++) {
    let b = new PIXI.Sprite(textures['bird0.png']);
    b.scale.set(0.5);
    b.x = wST - (i + 1) * (b.width + 5);
    b.y = hST - 25;
    app.stage.addChild(b);
    tLife.push(b);
    b.anchor.set(0.5);
  }
}
function createReady() {
  ready = new PIXI.Sprite(textures['get_ready.png']);
  //ajoute le sprite sur la scène
  app.stage.addChild(ready);
  ready.anchor.set(0.5);
}
function createGo() {
  go = new PIXI.Sprite(textures['game_over.png']);
  //ajoute le sprite sur la scène
  app.stage.addChild(go);
  go.anchor.set(0.5);
}
function collide(r1, r2) {
  return !(
  r1.x + r1.width < r2.x ||
  r2.x + r2.width < r1.x ||
  r1.y + r1.height < r2.y ||
  r2.y + r2.height < r1.y
  )
}