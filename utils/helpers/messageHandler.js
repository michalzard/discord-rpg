const { commands } = require("../../commands/index");
module.exports.MessageHandler = class MessageHandler {
  static prefix = "!";
  static handle(message) {
    if (message.author.bot) return;
    if (message.content.startsWith(this.prefix)) {
      const [...args] = message.content
        .trim()
        .substring(this.prefix.length)
        .split(/\s+/);
        
      this.runCommand(message, args);
    }
  }
  static runCommand(message, args) {
    if (!args[0]) return;
    //if first command exits, example "!user , !adventure" and so on
    // use their specific run function
    if (commands[`${args[0].toLowerCase()}`])
      commands[`${args[0].toLowerCase()}`].run(message, args);
    else message.reply("This command doesn't exist,to learn more use `!help`");
  }
};
