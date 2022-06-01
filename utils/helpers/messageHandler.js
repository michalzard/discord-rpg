const { adventure } = require("../../commands/adventure");
const { user } = require("../../commands/user");
module.exports.MessageHandler = class MessageHandler {
  static prefix = "!";
  static handle(message) {
    if (message.author.bot) return;
    if (message.content.startsWith(this.prefix)) {
      const [...args] = message.content
        .trim()
        .substring(this.prefix.length)
        .split(/\s+/);
      const mainArg = args[0];
      this.runCommand(message, mainArg);
    }
  }
  static runCommand(message, arg) {
    if (!arg) return;
    switch (arg) {
      case "user.create":
        user.create(message);
        break;
      case "user.info":
        user.info(message);
        break;
      case "adventure":
        adventure.start(message);
        break;
    }
  }
};
