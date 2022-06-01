const { Client, Intents, ClientPresence } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  presence:{
    status:"online",
    activities:[{name:"!help to start your adventure",type:"PLAYING"}]
  }
});
require("dotenv").config();
const mongoose = require("mongoose");

const { MessageHandler } = require("./utils/helpers/messageHandler");

//init
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Logged in a database");
    })
    .catch((e) => {
      console.log(e);
    });
});

client.login(`${process.env.BOT_TOKEN}`);

client.on("messageCreate", (msg) => {
  MessageHandler.handle(msg);
});
