const fs = require("fs");
const path = require("path");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const cmdFolderPath = path.resolve("./commands");
const cmdFolderExists = fs.existsSync(cmdFolderPath);

const fileContent = `
module.exports = {
    description:"Default command desc",
    run: function(message,args){
    message.reply("Command created via script");

    if (!args || !message) return;
    //First argument is user obviously
    //second argument which will be call for function
    const secondArgument = args[1];
    switch (secondArgument) {
      //check for 2nd argument to specify logic
    }
    }
  };
`;

if (!cmdFolderExists) {
  const newFolderPath = fs.mkdirSync(cmdFolderPath, { recursive: true });
  readline.question("Enter command name\n", (name) => {
    fs.writeFileSync(
      `${newFolderPath}\\${name ? name : "new_command"}.js`,
      fileContent
    );
    readline.write(`${name ? name : "new_command"}.js created`);
    readline.close();
  });
} else {
  readline.question("Enter command name\n", (name) => {
    fs.writeFileSync(
      `${cmdFolderPath}\\${name ? name : "new_command"}.js`,
      fileContent
    );
    readline.write(`${name ? name : "new_command"}.js created`);
    readline.close();
  });
}
