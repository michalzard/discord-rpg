const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Message,
} = require("discord.js");
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
          adventureMonsterInteractionPrompt(message);
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

//TODO : Add to adventure manager
function adventureMonsterInteractionPrompt(message) {
  const skeleton = {
    hp: 15,
    hpMax: 15,
    drops: {
      coins: Math.floor(Math.random() * 100) + 15,
    },
  };
  const monsterEmbed = new MessageEmbed({
    title: "Skeleton appeared!",
    description: "Sppoky Scary skeleton",
    fields: [
      {
        name: "Health",
        value: `${skeleton.hp}/${skeleton.hpMax}`,
        inline: true,
      },
      {
        name: "Drops",
        value: skeleton.drops.coins.toString(),
        inline: true,
      },
    ],
  });
  //player interactions
  const playerIntRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("attack")
      .setLabel("Attack")
      .setStyle("DANGER"),
    new MessageButton()
      .setCustomId("skill")
      .setLabel("Skill")
      .setStyle("DANGER"),
    new MessageButton()
      .setCustomId("use_item")
      .setLabel("Use Item")
      .setStyle("SECONDARY")
  );
  const filter = (buttonInt) => {
    return message.author.id === buttonInt.user.id;
  };
  const playerIntCollector = message.channel.createMessageComponentCollector({
    filter,
    max: 1000,
    time: 1000 * 60,
  });

  playerIntCollector.on("collect", async button => {
    console.log(button);
    button.deferUpdate();
  })

  message
    .reply({ embeds: [monsterEmbed], components: [playerIntRow] })
    .then((_message) => {
      playerIntCollector.on("end", (collection) => {
        switch (collection.first().customId) {
          case "attack":
            skeleton.hp -= 5;
            monsterEmbed.fields[0].value = `${skeleton.hp}/${skeleton.hpMax}`;
            playerIntCollector.resetTimer();
            _message.edit({ embeds: [monsterEmbed] ,components:[playerIntRow]});
            
            break;
          case "skill":
            console.log("skill");
            break;
          case "use_item":
            console.log("use_item");
            break;
        }
      });
    });
}
