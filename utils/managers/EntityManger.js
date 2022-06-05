const User = require("../../schemas/user");
const { LevelManager } = require("./LevelManager");

class Entity {
  constructor(name) {
    this.name = name || "Entity Name ";
    this.hp = 20;
    this.hpMax = 20;
    this.coins = Math.floor(Math.random() * 50) + 5;
    this.xp = Math.floor(Math.random() * 25) + 5;
    this.items = [];
  }
}
class EntityManager {
  static Types = {
    Skeleton: new Entity("Skeleton"),
  };
}

//Player Handler

class PlayerEntity extends Entity {
  constructor() {
    super("Player");
  }
  /**
   *
   * @param {*} id author's id , Number
   * number gets cast as string to lookup user in db
   */
  static async getById(userId) {
    const query = await User.find({ id: userId.toString()});
    return query[0];
  }
  static async levelUp(currentXp,userId) {
    await this.getById(userId).then((user) => {
    if(!user) return;
      if (currentXp >= user.nextLevelXP) {
        const remainder = currentXp - user.nextLevelXP;
        console.log(remainder);
        user.level++;
        user.xp=0;
        user.nextLevelXP = LevelManager.maxXPByLevel(user.level);
        if (remainder >= 0) user.xp = remainder;
        
        user.save();
        //level up, add remainder xp to next level
      }
    });
  }
}

module.exports = {
  Entity: EntityManager,
  Player: PlayerEntity,
};
