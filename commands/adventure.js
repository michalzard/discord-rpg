// const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const User = require("../schemas/user");
const { AdventureManager } = require("../utils/managers/AdventureManager");
const { Player } = require("../utils/managers/EntityManager");
const sameUserFilter = (buttonInt) => {
  return message.author.id === buttonInt.user.id;
};

module.exports.adventure = {
  start: async (message) => {

   const fUser = await User.find({id:message.author.id.toString()});
    const user = fUser[0];

    if(user){
    const collector = message.channel.createMessageComponentCollector({
      sameUserFilter,
      max: 1,
      time: 1000 * 60,
    });
    collector.on("end", async (collection) => {
      if (collection.first().customId == null) return;
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
        content: isPlayerAlive ? "Debugging with level 5" : `${user.displayName} is dead! Use !revive to resurrect`,
        embeds: [],
        components: isPlayerAlive ? [AdventureManager.getAreaActionMenu(5)] : [],
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

/**
 * Every 5 levels, 2~3 entities, drop items & coins
 *
 *
 */

//TODO : Add to adventure manager
// function adventureMonsterInteractionPrompt(message) {
//   console.log("prompted to attack skely");
//   const skeleton = {
//     hp: 15,
//     hpMax: 15,
//     drops: {
//       coins: Math.floor(Math.random() * 100) + 15,
//     },
//   };

//   const monsterEmbed = new MessageEmbed({
//     title: "Skeleton appeared!",
//     description: "Sppoky Scary skeleton",
//     fields: [
//       {
//         name: "Health",
//         value: `${skeleton.hp}/${skeleton.hpMax}`,
//         inline: true,
//       },
//       {
//         name: "Drops",
//         value: skeleton.drops.coins.toString(),
//         inline: true,
//       },
//     ],
//   });
//   //player interactions
//   const playerIntRow = new MessageActionRow().addComponents(
//     new MessageButton()
//       .setCustomId("attack")
//       .setLabel("Attack")
//       .setStyle("DANGER"),
//     new MessageButton()
//       .setCustomId("skill")
//       .setLabel("Skill")
//       .setStyle("DANGER"),
//     new MessageButton()
//       .setCustomId("use_item")
//       .setLabel("Use Item")
//       .setStyle("SECONDARY")
//   );

//   const playerIntCollector = message.channel.createMessageComponentCollector({
//     sameUserFilter,
//     max: 1000,
//     time: 1000 * 60,
//   });

//   playerIntCollector.on("collect", async (interaction) => {
//     interaction.deferUpdate();

//     if (skeleton.hp > 0) {
//       switch (interaction.customId) {
//         case "attack":
//           skeleton.hp -= 5;
//           monsterEmbed.fields[0].value = `${skeleton.hp}/${skeleton.hpMax}`;
//           interaction.message.edit({
//             embeds: [monsterEmbed],
//             components: [playerIntRow],
//           });
//           if (skeleton.hp === 0) {
//             playerIntCollector.stop();
//             //VICTORY OR DEFEAT SCREEN
//             interaction.message.edit({
//               content: `${interaction.user.username} slayed Skeleton`,
//               embeds: [],
//               components: [],
//             });
//           }
//           break;
//         case "skill":
//           console.log("skill");
//           break;
//         case "use_item":
//           console.log("use_item");
//           break;
//       }
//     }
//   });

//   message.reply({ embeds: [monsterEmbed], components: [playerIntRow] });
// }
