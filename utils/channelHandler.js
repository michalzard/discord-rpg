module.exports.Channel = class Channel {
  static exists(message, name) {
    const channelExists = message.guild.channels.cache.find(channel => channel.name === name);
    if(channelExists) return true;
    else return false;
  }
  static create(message, channelName, type) {
    if (this.exists(message, channelName)) return;
    else {
      message.guild.channels.create(channelName, {
        type: `GUILD_${type.toUpperCase() || "TEXT"}`,
      });
    }
  }
};
