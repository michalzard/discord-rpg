const { Player } = require("../utils/managers/EntityManager");
const Item = require("../schemas/item");
module.exports = {
  description: "Default command desc",
  run: async function (message) {
    message.reply("debugging inventory system");
    const query = await Item.find({ item_id: 1 });
    const item = query[0];
    Player.addToInventory(message, item);
  },
};
