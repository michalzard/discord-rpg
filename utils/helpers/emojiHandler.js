//Should be used as Array of GuildEmojis
module.exports.Emoji = class Emoji {
  static getEmojiList(message) {
    return message.guild.emojis.cache.map((emoji) => {
      return { name:emoji.name , id: emoji.id }; //if name is specified return just that item
    }).filter(emoji=>{return emoji});//filter out undefined or missing emojis
   
  }
  static getEmojiURL(emojiID) {
    return `https://cdn.discordapp.com/emojis/${emojiID}.webp?size=96&quality=lossless`;
  }
};
