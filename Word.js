/**
 * 
 * @param {number} x x coordinate for the word when created
 * @param {number} y y coordinate for the word when created
 * @param {String} text text for the word 
 * @param {String} color color of the box around the word
 */
function Word(x, y, text, color) {

  this.position = createVector(x, y);

  this.color = color; // color

  this.text = text; // text do be typed
  this.size = text.length * 15; // size

  this.TextProgress = ""; // text which the user has correctly inputted

  this.intact = true; // whether the astroid is on-screen or not
}

/**
 * moves Words down the field
 */
Word.prototype.update = function () {

  // The higher the score, the faster the words move
  this.position.y += map(score, 0, 1000, 1, 15);

  if (this.position.y > 0.9 * height) { // Y position of the ship
    gameOverDraw();
  }
};

/**
 * Checks if a specific key correspond to the next letter of the word to be typed
 * @param {String} currentKey the current key (letter) pressed
 */
Word.prototype.check = function (currentKey) {

  var length = this.TextProgress.length + 1;

  if (this.text.substring(0, length) === this.TextProgress + currentKey) {
    projectiles.push(new Projectile())
    this.TextProgress += currentKey;
  }
};

/**
 * draws Word
 */
Word.prototype.draw = function () {

  fill(this.color);

  // Box around the word
  stroke(0);
  strokeWeight(3);
  rectMode(CENTER)
  rect(this.position.x, this.position.y, this.size, 25);

  // Word
  noStroke();
  textAlign(CENTER);
  textSize(30);
  fill(255);
  text(this.text, this.position.x, this.position.y);
};

/**
 * Checks which word from the field should be targeted
 * @param {String} currentKey key (letter) typed on the keyboard
 * @param {Array<Word>} field the field array containing the words on screen
 */
function findWord(currentKey, field) {

  for (var i = 0; i < field.length; i++) {
    if (field[i].text.startsWith(currentKey)) {
      return field[i];
    }
  }
  return null;
}