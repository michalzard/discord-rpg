//Calculate next amount of needed xp based on player's level

module.exports.LevelManager = class LevelManager {
  static startingMaximum = 200;
  static getMissingXP(xp, maxXP) {
    return maxXP - xp;
  }
  static maxXPByLevel(level) {
    return this.startingMaximum * 1.35 * level;
  }
};
