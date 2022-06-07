const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const User = require("../../schemas/user");
const { Entity, Player } = require("./EntityManager");
const { LevelManager } = require("./LevelManager");

module.exports.AdventureManager = class AdventureManager {
  //todo: load entities for areas from db
  static areas = [
    {
      name: "Abandoned Forest",
      minReqLevel: 0,
      monsters: [Entity.Types.Skeleton],
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
            `${area.name} ${
              area.minReqLevel == 0 ? "" : `(lvl.${area.minReqLevel})`
            } ${area.minReqLevel >= playerLevel ? "🔒" : ""}`
          )
          .setStyle("SUCCESS")
          .setDisabled(area.minReqLevel >= playerLevel ? true : false)
      );
    }
    return areaMenu;
  }

  //Shows Enemy
  //Shows buttons to interact with enemy
  static getFightMenu(message, areaName = "Default_Area") {
    const filter = (interaction) => {
      return message.author.id === interaction.user.id;
    };
    let randomEnemy;
    for (let i = 0; i < this.areas.length; i++) {
      const area = this.areas[i];
      if (area.name == areaName) {
        randomEnemy = area.monsters[0];
        randomEnemy.hp = randomEnemy.hpMax;//make sure hp is reset
      }
    }
    /**
     * 4. display enemy health + dynamically update said health
     * 5. create actionRow with button for attack,way to go into inventory
     */
    const fightEmbed = new MessageEmbed({
      title: `${randomEnemy.name} has appeared`,
      description: `Skeleton stats`,
      fields: [
        {
          name: "Health",
          value: `${randomEnemy.hp}/${randomEnemy.hpMax}`,
          inline: true,
        },
        {
          name: "Drops",
          value: `Coins - ${randomEnemy.coins.toString()}\n`,
          inline: true,
        },
      ],
    });

    const fightActions = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("fight")
        .setLabel("Fight")
        .setStyle("DANGER"),
      new MessageButton()
        .setCustomId("inventory")
        .setLabel("Inventory")
        .setStyle("SECONDARY")
    );
    const fightCollector = message.channel.createMessageComponentCollector({
      filter,
      time: 1000 * 1000,
    });

    fightCollector.on("collect",(i) => {
      i.deferUpdate();
      if (i.customId == null) return;
      switch (i.customId) {
        case "fight":
          if (randomEnemy.hp <= 5) {randomEnemy.hp -= 5;fightCollector.stop(`Entity[${randomEnemy.name}] died`); break;}
          randomEnemy.hp -= 5;
          randomEnemy.attack(i);
          //manually update health
          fightEmbed.fields[0].value = `${randomEnemy.hp}/${randomEnemy.hpMax}`;
          i.message.edit({
              embeds: [fightEmbed],
              components: [fightActions],
            });
          break;
      }
    });

   message.reply({
      embeds: [fightEmbed],
      components: [fightActions],
    }).then(()=>{
      //on entity kill
      fightCollector.on("end", async(i) => {
       
        // i is map of all collected interactions
        if(i.last().message) {
          //display 
          const userById = await User.find({id:i.last().user.id.toString()});
          const user = userById[0];
          if(user){
          user.coins += randomEnemy.coins;
          user.xp += randomEnemy.xp;
          Player.levelUp(message,user.xp,user.id);
          user.save();
          const missingXP = LevelManager.getMissingXP(user.xp,user.nextLevelXP);
      
          i.last().message.edit({
          content:`**${randomEnemy.name} has been slain :skull:**\n**You received ${randomEnemy.coins} :coin: **\n**You received ${randomEnemy.xp} :hourglass:**\n${missingXP > 0 ? `**${missingXP.toString()} :hourglass: remaining to next level**` : ''} `,
          embeds: [],
          components:[]});
          }else{
            i.last().message.edit({content:`[Debug] there was error saving user data`});
          }
      }
      });
    });
  }

  
  //
  static async getAreaEnterMenu(message, areaID = "Default_Area") {
    const filter = (interaction) => {
      return message.author.id === interaction.user.id;
    };

    const areaName = areaID.replace("_", " ");

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
          interaction.message.delete();//deletes previous embed(area prompt)
          this.getFightMenu(message, areaName);
          break;
        case "cancel":
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
};
