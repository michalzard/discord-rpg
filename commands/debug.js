const Item = require("../schemas/item");
const user = require("../schemas/user");
const { Emoji } = require("../utils/helpers/emojiHandler");

module.exports = {
  description: "debugging",
  run: async function (message, args) {
    if (!args) return;
    if (args[1] === "generateItem") {
      const emojiList = Emoji.getEmojiList(message);
      const hpPotion = emojiList[0];
      const generatedItem = new Item({
        icon: {
          name: hpPotion.name,
          id: hpPotion.id,
        },
      });
      generatedItem.save();
    }

    const userQuery = await user.find({ id: message.author.id });
    const fUser = userQuery[0];
    if (args[1] === "addItem") {
      const itemId = args[2];
      if (itemId) {
        const itemQuery = await Item.find({ item_id: itemId });
        const newItem = itemQuery[0];

        if (fUser && newItem) {
          fUser.addItem(newItem);
        } else {
          message.reply("cannot find item or user");
        }
      }
    }
  },
};
