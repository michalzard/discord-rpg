const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports.AdventureManager = class AdventureManager {
  //todo: load entities for areas from db
  static areas = [
    {
      name: "Abadoned Forest",
      minReqLevel: 0,
      monsters: [{ name: "Skeleton", hp: 25, hpMax: 25, coinsToDrop: 69 }],
    },
    { name: "Graveyard", minReqLevel: 15 },
    { name: "Ancient Temple", minReqLevel: 25 },
  ];

  static getAreaIds() {
    let ids = [];
    for (let i = 0; i < this.areas.length; i++) {
      ids.push(this.areas[i].name.replace(" ", "_"));
    }
    return ids;
  }

  static getUnlockedAreas(level) {
    let unlockedAreas = [];
    for (let i = 0; i < this.areas.length; i++) {
      const area = this.areas[i];
      if (area.minReqLevel <= level) unlockedAreas.push(area);
    }
    return unlockedAreas;
  }

  //Returns MessageActinRow with all the levels avail
  //change styles depending on if area is unlocked or not
  static getAreaActionMenu(playerLevel) {
    const areaMenu = new MessageActionRow();
    for (let i = 0; i < this.areas.length; i++) {
      const area = this.areas[i];
      areaMenu.addComponents(
        new MessageButton()
          .setCustomId(area.name.replace(" ", "_"))
          .setLabel(
            `${area.name} 
          ${area.minReqLevel == 0 ? "" : `(lvl.${area.minReqLevel})`} 
          ${area.minReqLevel >= playerLevel ? "🔒" : ""}`
          )
          .setStyle("SUCCESS")
          .setDisabled(area.minReqLevel >= playerLevel ? true : false)
      );
    }
    return areaMenu;
  }

  static async getAreaEnterMenu(message, areaID = "Default_Area") {
    const areaEnterEmbed = new MessageEmbed({
      title: `You are about to enter ${areaID.replace("_", " ")}`,
      description: `You can find list of monsters you can encounter here`,
      color: "RED",
    });
    const areaEnterActions = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("enter")
        .setLabel("Enter")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle("DANGER")
    );
    const filter = (interaction) => {
      return message.author.id === interaction.user.id;
    };
    const collector = message.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 60,
    });
    //interaction is what bot sends back to user
    collector.on("collect", async (interaction) => {
      interaction.deferUpdate();
      switch (interaction.customId) {
        case "enter":
          // show Fight
        interaction.message.edit({embeds:[this.getFightMenu(areaID.replace("_", " "))],components:[]});
          break;
        case "cancel":
          //go back to main menu
          interaction.message.edit({
            content: `<@${message.author.id}> escaped ${areaID.replace("_"," ")}`,
            embeds: [],
            components: [],
          });
          break;
      }
    });

    await message.reply({
      embeds: [areaEnterEmbed],
      components: [areaEnterActions],
    });
  }

  static getFightMenu(areaName = "Default_Area") {
     /**
     * 1. grab area name(done)
     * 2. lookup what enemies are spawning in said area(done)
     * 3. create embed with selected enemy(done)
     * 4. display enemy health + dynamically update said health
     * 5. create actionRow with button for attack,way to go into inventory
     */
    let randomEnemy ;
    for (let i = 0; i < this.areas.length; i++) {
      const area = this.areas[i];
      if (area.name == areaName) {
        randomEnemy = area.monsters[0];
      }
    }

    console.log(randomEnemy);
    const fightEmbed = new MessageEmbed({
      title:`${randomEnemy.name} has been discovered`,
      description:"Description",
      fields:[
        {
          name:"Health",
          value:`${randomEnemy.hp}/${randomEnemy.hpMax}`,
        },
        {
          name:"Coins",
          value:randomEnemy.coinsToDrop.toString(),
        }
      ]
    })
    return fightEmbed;
  }
};
