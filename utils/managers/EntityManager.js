const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const User = require("../../schemas/user");
const { LevelManager } = require("./LevelManager");

class Entity {
  constructor(name) {
    this.name = name || "Entity Name";
    this.hp = 20;
    this.hpMax = 20;
    this.coins = Math.floor(Math.random() * 50) + 5;
    this.xp = Math.floor(Math.random() * 50) + 5;
    this.items = [];
    this.icon = ""; // attachment://image.png
  }
  //deals 5 damage(debugging)
  async attackPlayer(interaction, damage) {
    //interaction.message => message from bot
    //interaction.user -> author
    const message = interaction.message;
    const user = await PlayerEntity.getById(interaction.user.id);

    if (user) {
      user.stats.hp -= damage;
      await user.save();
    } else {
      message.reply(`Unable to attack player`);
    }
  }
}

const skeletonEntity = new Entity("Skeleton");
const slimeEntity = new Entity("Slime");
skeletonEntity.icon = `skeleton.png`;
slimeEntity.icon = `slime.jpg`;

class EntityManager {
  static Types = {
    Skeleton: skeletonEntity,
    Slime: slimeEntity,
  };
}

class PlayerEntity extends Entity {
  constructor() {
    super("Player");
  }
  /**
   *
   * @param {*} id author's id , Number
   * number gets cast as string to lookup user in db
   */
  static async getById(userId) {
    const query = await User.find({ id: userId.toString() });
    return query[0];
  }
  /**
   *
   * @param {*} currentXp current xp of player beforte update
   * @param {*} userId player's id used to update player data
   */
  static async levelUp(message, currentXp, userId) {
    //TODO FIX THE PROBLEM WHEN XP IS EXACTLY THE SAME AS NEXTLEVELXP SO IT GOES TO 0 XP and level up
    //265 -> 270 / 270 xp in level 2 xp stays 270
    await this.getById(userId).then((user) => {
      if (!user) return;
      if (currentXp >= user.nextLevelXP) {
        //level up, add remainder xp to next level
        const remainder = currentXp - user.nextLevelXP;
        user.level++;
        user.nextLevelXP = LevelManager.maxXPByLevel(user.level);

        if (remainder > 0) {
          user.xp = remainder;
          console.log(`user xp with remainder added ${user.xp},r ${remainder}`);
        }
        user.save();
        const newLvlEmbed = new MessageEmbed({
          title: `${user.displayName} leveled up :tada: `,
          description: `**Congratulations**\nYour new level is ${user.level}\n**1 Talent point** has been added `,
        });
        message.reply({ embeds: [newLvlEmbed] });
      }
    });
  }

  /**
   * !user create command
   */
  static async create(message) {
    const { id, username } = message.author;
    const user = await this.getById(id);
    const filter = (buttonInt) => {
      return id === buttonInt.user.id;
    };

    if (user) {
      message.reply(
        "User already exists.\nIf this character is yours & you'd like to delete it type `!user.delete`\nTo get information type `!user.info`\nYou can only have __**1 character per account**__ "
      );
    } else {
      //PROMPT UP INTERACTION
      const classRow = new MessageActionRow()
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

      const collector = message.channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 60,
      });
      collector.on("end", async (collection) => {
        const newUser = new User({
          id: id.toString(),
          displayName: username,
          nextLevelXP: LevelManager.maxXPByLevel(1), //Starting level 1
        });

        switch (collection.first().customId) {
          case "warrior":
            newUser.class = "Warrior";
            break;
          case "mage":
            newUser.class = "Mage";
            break;
          case "rogue":
            newUser.class = "Rogue";
            break;
        }
        newUser.save();
        await message.reply({
          content: `${username}'s character was created!`,
          embeds: [],
          components: [],
        });
      });

      await message
        .reply({
          embeds: [selectEmbed],
          components: [classRow],
        })
        .then((msg) => {
          collector.on("collect", () => {
            msg.delete();
          });
        })
        .catch((err) => console.error(err));
    }
  }
  static async remove(message) {
    const { id } = message.author;
    if (id) {
      await User.deleteOne({ id }).then((data) => {
        console.log(data);
        if (data.deletedCount > 0)
          message.reply(
            "Your character was deleted.\nTo create new one you can use `!user create`"
          );
        else
          message.reply(
            "Unable to find your character.\nYou can start new one with `!user create`"
          );
      });
    } else return;
  }
  /**
   * !user info command
   * @param {*} message object that holds data about author,which is used to query character info
   */
  static async info(message) {
    if (!message.author.id) return;

    const user = await this.getById(message.author.id);
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
          value: `${user.xp.toString()}/${user.nextLevelXP.toString()} :hourglass:`,
          inline: true,
        },
        {
          name: "Currencies",
          value: `:coin: ${user.currency.coins.toString()}\n`,
          inline: true,
        },
        {
          name: "Attributes",
          value: `:heart: ${user.stats.hp} / ${user.stats.maxHp}\n:dash: ${user.stats.stamina}\n:muscle: ${user.stats.strength}\n:magic_wand: ${user.stats.magic}\n:ninja: ${user.stats.dexterity}`,
          inline: true,
        },
      ]);

      message.reply({ embeds: [userEmbed] });
    } else {
      message.reply(
        "Character doesn't exist.\nCreate one using `!user.create` command"
      );
    }
  }
  static async checkIfAlive(id) {
    const user = await this.getById(id);
    if (user) {
      //use revive token to restore health
      if (user.stats.hp <= 0) {
        return false;
      } else {
        return true;
      }
    }
  }
  //TODO: CLEAN THIS ONE OUT
  static async revive(message) {
    const { id } = message.author;
    const user = await this.getById(id);
    if (user && user.revival.remaining > 0) {
      if (user.stats.hp <= 0) {
        user.stats.hp = user.stats.maxHp;
        if (user.revival.remaning == 0) {
          const today = new Date();
          const reviveCD = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 2
          ); //x days cooldown
          user.revival.remaining--;

          user.revival.nextAvailable = reviveCD;
        }
        user.save();
        message.reply(
          `${user.displayName} was revived. ${user.revival.remaining} revives left`
        );
      } else {
        message.reply(`${user.displayName} is healthy.`);
      }
    } else {
      const dateExpiry = (someDate) => {
        const today = new Date();
        return (
          someDate.getDate() <= today.getDate() &&
          someDate.getMonth() <= today.getMonth() &&
          someDate.getFullYear() <= today.getFullYear()
        );
      };
      const canRefreshCooldown = dateExpiry(user.revival.nextAvailable);
      console.log(canRefreshCooldown);
      const today = new Date();
      const reviveCD = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 2 // next day
      );
      if (canRefreshCooldown) {
        // date is today or in past => able to revive
        user.revival.remaining = 2; // max - 1
        user.revival.nextAvailable = reviveCD;
        user.stats.hp = user.stats.maxHp;
        user.save();
        console.log(user.revival);
        message.reply(
          `**Cooldown refreshed**\n${user.displayName} was revived. ${user.revival.remaining} revives left. `
        );
      } else {
        user.revival.nextAvailable = reviveCD;
        user.revival.remaining = 3;
        user.save();
        message.reply(
          `Next available revive ${user.revival.nextAvailable
            .toUTCString()
            .substring(0, 17)}`
        );
      }
    }
  }

  static async addToInventory(message, item) {
    const { id } = message.author;
    const user = await this.getById(id);

    user.addItem(item);
  }

  static async showInventory(message) {
    const { id } = message.author;
    const user = await this.getById(id);
    if (user) {
      const { displayName, inventory } = user;
      let invDesc = "";
      if (inventory.length === 0) {
        invDesc = `_This inventory is empty_`;
      } else {
        for (let i = 0; i < inventory.length; i++) {
          const item = inventory[i];
          invDesc += `<:${item.icon.name}:${item.icon.id}> ${item.name} **x${item.quantity}** `;
        }
      }
      const inventoryEmbed = new MessageEmbed({
        title: `${displayName}'s Inventory`,
        description: invDesc,
        color: "GOLD",
      });

      message.reply({ embeds: [inventoryEmbed] });
    } else {
      message.reply(
        `Your inventory is unavailable.\nUse \`!user info\` or \`!user create\` to check if you have created character`
      );
    }
  }
}

module.exports = {
  Entity: EntityManager,
  Player: PlayerEntity,
};
