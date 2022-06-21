const { MessageEmbed } = require("discord.js");
const { Player } = require("../utils/managers/EntityManager");
const Item = require("../schemas/item");
const { Emoji } = require("../utils/helpers/emojiHandler");

module.exports = {
  description: "available user commands",
  run: async(message, args) => {
    // console.log(args);
    if (!args || !message) return;
    //First argument is user obviously
    //second argument which will be call for function
    const secondArgument = args[1];
    switch (secondArgument) {
      case "create":
        module.exports.create(message);
        break;
      case "info":
        module.exports.info(message);
        break;
      case "revive":
        module.exports.revive(message);
        break;
      case "delete":
        module.exports.remove(message);
        break;
      case "item":
        const query= await Item.find({item_id:1});
        const item = query[0];
        const emojiList=Emoji.getEmojiByName(message);
        console.log(emojiList);
        const item1Embed=new MessageEmbed({title:item.name,description:`${item.quantity}/${item.quantityMax}`});
        item1Embed.setAuthor({name:item.name,iconURL:Emoji.getEmojiURL(emojiList[0].id)});
        message.reply({embeds:[item1Embed]});
        break;
      default:
        const embed = new MessageEmbed({
          title: "Available user commands",
          description: `
            \`!user create\` creates character , stays persistent on the account\n
            \`!user delete\` removes character altogether\n
            \`!user info\` shows character name,stats,currencies,attributes\n
            \`!user revive\` revives dead character,revivals are limited to 3x a day \n
            `,
        });
        message.reply({ embeds: [embed] });
        break;
    }
  },
  create: async (message) => {
    //prompt user with reply with embed
    //after user selection save entry to database
    Player.create(message);
  },
  remove: async (message) => {
    //lookup user if it exists remove it
    Player.remove(message);
  },
  info: async (message) => {
    //lookup user by name
    // if none then reply
    // if found then reply with embed and all rpg stats
    Player.info(message);
  },

  revive: (message) => {
    Player.revive(message);
  },
};
