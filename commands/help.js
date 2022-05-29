module.exports.help = {
  cmdName: "Help",
  description: "Shows all available commands",
  run: function(message){
    if (message) message.reply("Here's gonna be help embed");
  },
};
