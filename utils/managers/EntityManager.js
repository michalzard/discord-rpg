const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const User = require("../../schemas/user");
const { LevelManager } = require("./LevelManager");

class Entity {
  constructor(name) {
    this.name = name || "Entity Name ";
    this.hp = 20;
    this.hpMax = 20;
    this.coins = Math.floor(Math.random() * 50) + 5;
    this.xp = 5;
    this.items = [];
  }
  //deals 5 damage(debugging)
  async attack(interaction) {
    //interaction.message => message from bot
    //interaction.user -> author
    const message = interaction.message;
    const user = await PlayerEntity.getById(interaction.user.id);

    if (user) {
      user.stats.hp -= 5;
      user.save();
      message.edit(`**CombatLog**:${user.displayName} recieved 5 damage,currentHp:${user.stats.hp}`);
    } else {
      message.reply(`Unable to attack player`);
    }
  }
}
class EntityManager {
  static Types = {
    Skeleton: new Entity("Skeleton"),
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
          user.save();
          console.log(`user xp with remainder added ${user.xp},r ${remainder}`);
        }
        user.save();
        const newLvlEmbed = new MessageEmbed({
          title: `${user.displayName} leveled up `,
          description: `Congratulations,Your new level is ${user.level}\n1 **Talent point** has been added `,
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
          value: `:coin: ${user.coins}\n`,
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
}

module.exports = {
  Entity: EntityManager,
  Player: PlayerEntity,
};