var mainTitle = "Type F"

var wordList = []; // Quick patch to avoid wordlist undefined error
var loadedWordList;

var canvasWidth = 500;
var canvasHeight = 950;

// variable that represent which screen we're at
var currentDraw = mainMenuDraw;

var score = 0;
// score animation variables
isAnimated = false;
var initialScoreSize = 20
var ScoreSize = initialScoreSize;

var currentTarget;
var field = [];

var gameBorder; // color for border

var currentKey;
var pauseKey = ""
var pauseStatus = false;

var img;

var projectiles = []

// Background variables
var bg;
var y1 = 0;
var y2;
var scrollSpeed = 2;

/**
 * Called before setup(), allows to load some assets before canvas being drawn
 */
function preload() {
  // Default json file with 4.35MB of words
  $.getJSON("assets/french-words.json", function (json) {
    wordList = json
  });

  img = loadImage('assets/ship.png');
  flame = loadImage("assets/flame_s.gif");
  bg = loadImage('assets/bg2.jpg');

  // Prevents backspace to naviguate back
  window.onkeydown = function (e) {
    if (e.keyCode == 8 && e.target == document.body){
      e.preventDefault();
    } else if (e.key === "Escape" && e.target == document.body) {
      pauseHandler()
    }
  }

}

/**
 * Called at startup
 */
function setup() {

  createCanvas(canvasWidth, windowHeight);
  
  gameBorder = color(255, 0, 0);
  y2 = height;

  // In case of reset/new game
  field = []
  score = 0;
  y1 = 0;

  if(wordList.length > 0){
    createWord(random(wordList))
  }

  currentTarget = null;

  draw = currentDraw;
}

/**
 * Called at the beginning of each game
 */
function newGameSetup() {

  // gameBorder = color(255, 0, 0);
  y2 = height;

  // In case of reset
  field = []
  score = 0;
  y1 = 0;

  createWord(random(wordList))

  currentTarget = null;
}



/**
 * Create a new word object
 * @param {string} word to be created
 */
function createWord(word) {
  field.push(new Word(random(width - 150) + 75, 0, word, randomColor()));
}

/**
 * Return a random rgb color
 */
function randomColor() {
  return color(random(10, 255), random(10, 255), random(10, 255))
}

/**
 * Called at each frame
 */
function draw() {
  // Will be replaced with the correct draw function
}

/**
 * Handles the update of the words on screen and the score
 */
function handleField() {

  for (var i = field.length - 1; i >= 0; i--) {

    field[i].update();

    if (field[i].intact) {
      // Word still on screen

      field[i].draw();
    } else {
      // Word has been destroed
      projectiles = []
      score += field[i].text.length;
      isAnimated = true;
      field.splice(i, 1); // delete from array
      currentTarget = null;
    }
  }

  // attempt new Word
  if (frameCount % 60 === 0) { // every second

    if (random() > map(score, 0, 1000, 0.8, 0.01)) { // more difficult as the score increases
      createWord(random(wordList));
    }
  }
}

/**
 * Handles the keyboard input, and trigger the check on words and the pause button
 */
function keyTyped() {
  currentKey = key
  if (currentKey == pauseKey) {
    pauseHandler()
  }
  if (!pauseStatus) {
    if (currentTarget) {
      // if we have honed in on a specific Word

      currentTarget.check(currentKey);
    } else {
      // find the astroid to target
      currentTarget = findWord(currentKey, field);

      if (currentTarget) {
        currentTarget.check(currentKey);
      }
    }
  }
}

/**
 * Pause handler
 */
function pauseHandler() {
  if (!pauseStatus) {
    noLoop();
    pauseStatus = true;
  } else {
    pauseStatus = false;
    loop();

  }
}

/**
 * Handles user input
 */
function keyPressed() {}

/**
 * Make the background an infinite scroller
 */
function backgroundDraw() {
  image(bg, 0, y1, width, height);
  image(bg, 0, y2, width, height);

  y1 += map(score, 0, 1000, 1, 15);
  y2 += map(score, 0, 1000, 1, 15);

  if (y1 > height) {
    y1 = -height;
  }
  if (y2 > height) {
    y2 = -height;
  }
}

/**
 * draws the border around the ship
 */
function drawBorder() {
  /* gamelimit */
  stroke(gameBorder);
  strokeWeight(2);
  line(0, 0.9 * height, width, 0.9 * height);
}

/**
 * draws the projectile
 */
function drawProjectile() {
  if (!currentTarget)
    return;

  stroke(color(255, 0, 0));
  strokeWeight(currentTarget.TextProgress.length);

  // ship to word
  BeginX = width / 2
  BeginY = height * 0.9
  destX = currentTarget.position.x
  destY = currentTarget.position.y

  slope = ((destY - height * 0.9) / (destX - width / 2));
  b = destY - slope * destX

  // For each of the projectiles, we update the coordinates based on the line equation y = slope * x + b
  projectiles.forEach(p => {
    if (dist(((BeginY * p.stepProjectile) - b) / slope, BeginY * p.stepProjectile, destX, destY) > 20) {
      p.stepProjectile -= 0.02
      drawPoint(((BeginY * p.stepProjectile) - b) / slope, BeginY * p.stepProjectile);
    } else { // The projectile hit the target
      projectiles.splice(projectiles.indexOf(p), 1);
      if (projectiles.length == 0) {
        currentTarget.intact = (currentTarget.TextProgress !== currentTarget.text) // If the last projectile in the array hit the word, destroy it
      }
    }
  });
}

/**
 * Draws the word progress (default on bottom left of the screen)
 */
function drawCurrentWord() {
  if (!currentTarget)
    return;
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(30);
  text(currentTarget.TextProgress, 10, height - 40);
}

/**
 * Draws the score
 * @param {number} x x coordinate of the score
 * @param {number} y y coordinate of the score
 * @param {number} size font size of the score
 * @param {*} align alignement of the score
 */
function drawScore(x, y, size, align) {

  noStroke();
  textAlign(align)
  textFont('Helvetica');
  textSize(size);
  fill(255);
  text(`Score ${score}`, x, y);
}

/**
 * Creates a rebound animation on the score
 * @param {number} ScoreSize Current font size for the score
 * @param {number} maxSize Maximum font size for the score
 */
function ScoreAnimation(ScoreSize, maxSize) {
  ScoreSize *= 1.005
  textSize(ScoreSize);
  if (ScoreSize > maxSize) {
    isAnimated = false;
    ScoreSize = initialScoreSize;
  }
  return ScoreSize + 1
}

/**
 * Draw function called during main game screen
 */
function mainDraw() {
  height = windowHeight
  backgroundDraw()
  push();
  imageMode(CENTER);
  scale(-1, 1);
  translate(-width / 2, height * 0.9 + 50)
  image(flame, 0, 0, flame.width * 0.8, flame.height );
  pop();
  image(img, width * 0.5 - img.width * 0.1, height * 0.9, img.width * 0.2, img.height * 0.2);

  drawBorder();
  drawProjectile();
  drawCurrentWord();
  if (isAnimated) {
    ScoreSize = ScoreAnimation(ScoreSize, 40)
  } else {}
  drawScore(width * 0.90, height * 0.05, ScoreSize, RIGHT);

  handleField();
  if (pauseStatus) {
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(80);
    text('Pause !', width / 2, height / 2);
  }
}

/**
 * Main menu
 */
function mainMenuDraw() {

  draw = function () {
    height = windowHeight
    backgroundDraw()
    fill(color(255, 246, 120));

    textAlign(CENTER);
    stroke(255);
    strokeWeight(2.5);
    textSize(80);
    textFont('Cambria')
    text(mainTitle, width / 2, height / 4);

    drawButton(width / 2, height / 2 + 75, 230, 50, 20, "Start", function () {
      cursor(ARROW);
      mouseClicked = function () {};
      dropzone.style('visibility', 'hidden');
      currentDraw = mainDraw;
      clear();
      setup();
    })


    dropzone = select("#dropzone");
    dropzone.position(windowWidth / 2 - 80, height * 0.9);
    dropzone.drop(handleFile, fileDropped);



  }
}

/**
 * When a file is dropped in the dropzone
 */
function fileDropped() {
  dropzone.html("File Loading...");
}

/**
 * Handles the loading of file in the dropzone
 * @param {File} file File object to be processed
 */
function handleFile(file) {
  if (!loadedWordList) {
    if (file.type != "text") {
      dropzone.html("Error, please try again");
    } else {
      dropzone.html("File Loaded !");
      loadedWordList = file.data.match(/[^\r\n]+/g);
      wordList = loadedWordList;
    }
  }
}

/**
 * stops loop, draws game over message
 */
function gameOverDraw() {

  draw = function () {
    height = windowHeight
    backgroundDraw()
    fill(255);

    textAlign(CENTER);
    drawScore(width / 2, height / 2 - 100, 50, CENTER)

    textAlign(CENTER);
    noStroke();
    textSize(80);
    text("Game Over!", width / 2, height / 2);
    drawButton(width / 2, height / 2 + 75, 200, 50, 20, "Replay", function () {
      cursor(ARROW);
      mouseClicked = function () {};
      clear();
      setup();
    })
  }
}

/**
 * Draws a button at specified coordinates
 * @param {number} x x coordinate for the center of the button
 * @param {number} y y coordinate for the center of the button
 * @param {number} w width of the button
 * @param {number} h height of the button
 * @param {number} radius radius of the rounded corners
 * @param {string} message message to be displayed on the button
 * @param {function} action function to be called when button is clicked
 */
function drawButton(x, y, w, h, radius, message, action) {

  fill(color(255, 246, 120));

  stroke(0);
  strokeWeight(1);
  rectMode(CENTER)
  rect(x, y, w, h, radius);
  rectMode(CORNER)
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  text(message, x, y);
  if (isMouseInside(x - w / 2, y - h / 2, w, h)) {
    cursor(HAND);
    mouseClicked = action
  } else {
    cursor(ARROW);
    mouseClicked = function () {};
  }
}

/**
 * Check if the mouse pointer is inside a box
 * @param {number} x x coordinate of the box
 * @param {number} y y coordinate of the box
 * @param {number} W width of the box
 * @param {number} H height of the box
 */
function isMouseInside(x, y, W, H) {
  return mouseX >= x && mouseX < x + W && mouseY >= y && mouseY < y + H;
}

/**
 * Draws a point for the projectile at x,y coordinates
 * @param {number} x x coordinate of the point
 * @param {number} y y coordinate of the point
 */
function drawPoint(x, y) {
  for (let i = 0; i < 5; i++) {

    strokeWeight((1 + i) * (1 + i));
    stroke(255, 0, 0, 100);
    ellipse(x, y, 0.5, 0.5);
  }
}