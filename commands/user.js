const { Player } = require("../utils/managers/EntityManager");

module.exports = {
  run: (message, args) => {
    // console.log(args);
    if (!args || !message) return;
    //First argument is user obviously
    //second argument which will be call for function
    const secondArgument = args[1];
    switch (secondArgument) {
      case "create":
        this.user.create(message);
        break;
      case "info":
        this.user.info(message);
        break;
      case "revive":
        this.user.revive(message);
        break;
      case "delete":
        this.user.remove(message);
        break;
      default:
        message.reply(
          "You need to use argument , for example `!user create` or `!user info`"
        );
        break;
    }
  },
  create: async (message) => {
    //prompt user with reply with embed
    //after user selection save entry to database
    Player.create(message);
  },
  remove: async (message) => {
    //lookup user if it exists remove it
    Player.remove(message);
  },
  info: async (message) => {
    //lookup user by name
    // if none then reply
    // if found then reply with embed and all rpg stats
    Player.info(message);
  },

  revive: async (message) => {
    Player.revive(message);
  },
};
