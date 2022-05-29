module.exports.AdventureManager = class AdventureManager {
  static AreaNames = ["Abadoned Forest", "Graveyard", "Ancient Temple"];

  static getAreaByLevel(level) {
    if (level > 0 && level <= 10)
      return {
        areaName: AdventureManager.AreaNames[0],
        monsters: ["m1", "m2", "m3"],
      };
  }
};
