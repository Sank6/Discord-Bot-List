const { Command } = require("klasa");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {});
  }

  async run(message, args) {
  if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send('No permission!')
    const config = require("@root/config.json");
    const Discord = require("discord.js");
    if (!args[0]) return message.channel.send("Specify a user");
    let user =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);
    if (!user) return message.channel.send(`That is not a valid user!`);
    let reason = message.content
      .split(`${config.discord_client.prefix}kick ${args[0]}`)
      .join(" ");
    if (!args[1]) reason = "Reason was not specified";
    user.kick();
    user.send(`Kicked from ${message.guild.name}! Reason: ${reason}`);
    message.channel.send("user has been kicked")
  }
};
