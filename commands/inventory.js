const { Player } = require("../utils/managers/EntityManager");

module.exports = {
  description: "shows player's belongings",
  run: async function (message,args) {
    Player.showInventory(message);
  },
};
