function Projectile() {
  this.x = width / 2;
  this.y = height * 0.9;
  this.stepProjectile = 1;

  /**
   * updates the projectile coordinates
   */
  Projectile.prototype.update = function (x, y) {
    this.x = x;
    this.y = y;
  }
}