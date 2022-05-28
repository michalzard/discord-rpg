const {Client,Intents} = require("discord.js");
const client = new Client({intents:[Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES]});
require("dotenv").config();
//init
client.on('ready',()=>{
    console.log(`Logged in as ${client.user.tag}`);
});


client.login(`${process.env.BOT_TOKEN}`);

client.on('messageCreate',(msg)=>{
    if(!msg.author.bot)
    msg.reply('debugging');
})