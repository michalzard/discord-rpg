const fs = require("fs");
const filesInCommandsFolder = fs.readdirSync(__dirname);
const commands = [];
filesInCommandsFolder.forEach((file) => {
  const cmdObject = require(`../commands/${file}`);
  //only add commands that arent empty files
  if(Object.keys(cmdObject).length > 0) commands[file.split(".")[0]] = require(`../commands/${file}`);
});


module.exports = {
  commands,
};
