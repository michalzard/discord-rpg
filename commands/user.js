const { Player } = require("../utils/managers/EntityManager");

module.exports.user = {
  cmdName: "User",
  description: "User creation & info",
  create: async (message) => {
    //prompt user with reply with embed
    //after user selection save entry to database
    Player.create(message);
  },

  info: async (message) => {
    //lookup user by name
    // if none then reply
    // if found then reply with embed and all rpg stats
   Player.info(message);
  }
};
