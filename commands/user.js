const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const User = require("../schemas/user");
const { Entity, Player } = require("../utils/managers/EntityManger");
const { LevelManager } = require("../utils/managers/LevelManager");

module.exports.user = {
  cmdName: "User",
  description: "User creation & info",
  create: async (message) => {
    //prompt user with reply with embed
    //after user selection save entry to database
    const { id, username, discriminator } = message.author;
    const foundUsers = await User.find({ id: message.author.id });
    const user = foundUsers[0];
    if (user) {
      message.reply(
        "User already exists.\nIf this character is yours & you'd like to delete it type `!user.delete`\nTo get information type `!user.info`"
      );
    } else {
      //PROMPT UP INTERACTION
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId("warrior")
            .setLabel("Warrior")
            .setStyle("DANGER")
        )
        .addComponents(
          new MessageButton()
            .setCustomId("mage")
            .setLabel("Mage")
            .setStyle("PRIMARY")
        )
        .addComponents(
          new MessageButton()
            .setCustomId("rogue")
            .setLabel("Rogue")
            .setStyle("SECONDARY")
        );
      const selectEmbed = new MessageEmbed({
        title: "Select Your Class",
        description: "Choose class for your character",
        color: "DARK_RED",
      });
      const filter = (buttonInt) => {
        return id === buttonInt.user.id;
      };
      const collector = message.channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 60,
      });
      collector.on("end", async (collection) => {
        const dName = `${username}#${discriminator}`;
        const userClass = new User({
          id:id.toString(),
          displayName: dName,
          nextLevelXP: LevelManager.maxXPByLevel(1), //Starting level 1
        });

        switch (collection.first().customId) {
          case "warrior":
            userClass.class = "Warrior";
            break;
          case "mage":
            userClass.class = "Mage";
            break;
          case "rogue":
            userClass.class = "Rogue";
            break;
        }
        userClass.save();
        await message.reply({
          content: `${username}'s character was created!`,
          embeds: [],
          components: [],
        });
      });

      await message
        .reply({
          embeds: [selectEmbed],
          components: [row],
        })
        .then((msg) => {
          collector.on("collect", () => {
            msg.delete();
          });
        })
        .catch((err) => console.error(err));
    }
  },

  info: async (message) => {
    //lookup user by name
    // if none then reply
    // if found then reply with embed and all rpg stats
    if (!message.author.id) return;
    const foundUsers = await User.find({ id: message.author.id });
    const user = foundUsers[0];
    if (user) {
      const userEmbed = new MessageEmbed({
        author: {
          name: user.displayName,
          iconURL: message.author.displayAvatarURL(),
        },
        color: "RED",
      });
      userEmbed.addFields([
        { name: "Class", value: user.class, inline: true },
        { name: "Level", value: user.level.toString(), inline: true },
        {
          name: "Experience",
          value: `${user.xp.toString()}/${user.nextLevelXP.toString()}`,
          inline: true,
        },
      ]);

      message.reply({ embeds: [userEmbed] });
    } else {
      message.reply(
        "Character doesn't exist.\nCreate one using `!user.create` command"
      );
    }
  },

  //inventory
  //lvl up update
};
