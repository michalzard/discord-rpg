const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const User = require("../schemas/user");
const { AdventureManager } = require("../utils/AdventureManager");

module.exports.adventure = {
  start: (message) => {
    const adventureEmbed = new MessageEmbed({
      title: `Ready for adventure ${message.author.username} ?`,
      description: `You are about to enter ${
        AdventureManager.getAreaByLevel(4).areaName
      }`,
      color: "DARK_RED",
    });

    const enterRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("enter")
        .setLabel("Enter")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("leave")
        .setLabel("Leave")
        .setStyle("DANGER")
    );
    const filter = (buttonInt) => {
      return message.author.id === buttonInt.user.id;
    };
    const collector = message.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 60,
    });
    collector.on("end", async (collection) => {
      switch (collection.first().customId) {
        case "enter":
          message.reply("Here goes embed that displays what mob will you fight,action buttons for attacking,using items")
          break;
        case "leave":
        
          message.reply("You fled from the area").then((msg) => {
            setTimeout(() => {
                msg.delete();
            }, 3000);
          });
          break;
      }
    });

    //once 1 of buttons is clicked,remove
    message
      .reply({ embeds: [adventureEmbed], components: [enterRow] })
      .then((msg) => {
        collector.on("collect", () => {
          msg.delete();
        });
      });
  },
};

/**
 * Every 5 levels, 2~3 entities, drop items & coins
 *
 *
 */
