// const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const User = require("../schemas/user");
const { AdventureManager } = require("../utils/managers/AdventureManager");
const sameUserFilter = (buttonInt) => {
  return message.author.id === buttonInt.user.id;
};

module.exports = {
  description:"discover areas and fight enemies",
  run: async (message,args) => {

   const fUser = await User.find({id:message.author.id.toString()});
    const user = fUser[0];

    if(user){
    const collector = message.channel.createMessageComponentCollector({
      sameUserFilter,
      max: 1,
      time: 1000 * 60,
    });
    collector.on("end", async (collection) => {
       
      if (!collection.first() || collection.first().customId == null) return;
      for (let i = 0; i < AdventureManager.areas.length; i++) {
        const mapExists = AdventureManager.getAreaIds()[i].includes(collection.first().customId);
        if (mapExists) {
        //pops up enter prompt
        AdventureManager.getAreaEnterMenu(message,collection.first().customId);
        }
      }
    });

    const isPlayerAlive = user.stats.hp >= 0 
    //once 1 of buttons is clicked,remove
    message.reply({
        content: isPlayerAlive ? `Debugging with player level ${user.level}` : `${user.displayName} is dead! Use \`!user revive\` to resurrect`,
        embeds: [],
        components: isPlayerAlive ? [AdventureManager.getAreaActionMenu(user.level)] : [],
      }).then((msg) => {
        collector.on("collect", () => {
          msg.delete();
        });
      });
  
    }else{
      message.reply("Cannot find character");
    }
  }

};

//Display number icon ,name of item and quantity
// display another embed that shows what kind of command they can use to "activate that item" or sell it form inventory