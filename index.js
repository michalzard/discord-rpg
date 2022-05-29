const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
require("dotenv").config();

const mongoose = require("mongoose");

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

const { MessageHandler } = require("./utils/messageHandler");

client.on("messageCreate", (msg) => {
  MessageHandler.handle(msg);
});
