//Should be used as Array of GuildEmojis
module.exports.Emoji = class Emoji {
  static getEmojiByName(message, name) {
    return message.guild.emojis.cache.map((emoji) => {
      if (name == null || name == "") return { id: emoji.id, name: emoji.name }; // return all emojis
      if (emoji.name === name) return { id: emoji.id, name }; //if name is specified return just that item
    }).filter(emoji=>{return emoji});//filter out undefined or missing emojis
   
  }
  static getEmojiURL(emojiID) {
    return `https://cdn.discordapp.com/emojis/${emojiID}.webp?size=96&quality=lossless`;
  }
};
