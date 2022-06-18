const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const filesInCommandsFolder = fs.readdirSync(__dirname);
const cmdAvailable = [];

filesInCommandsFolder.forEach((file, i) => {
  const cmdObject = require(`../commands/${file}`);

  if (Object.keys(cmdObject).length > 0)
    cmdAvailable[filesInCommandsFolder[i]] = cmdObject;
});

module.exports = {
  description: "Shows all available commands",
  run: function (message) {
    let descString = "";

    for (cmdName in cmdAvailable) {
      descString += ` \`!${cmdName.split(".")[0]}\` ${cmdAvailable[cmdName].description}\n `;
    }

    const helpEmbed = new MessageEmbed({
      title: "Available commands",
      description: descString,
    });
    message.reply({ embeds: [helpEmbed] });
  },
};
 