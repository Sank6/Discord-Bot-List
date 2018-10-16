const { Command } = require('klasa');
var Manager = require('../../manage.js');
var modLog;
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'unmutebot',
            runIn: ['text'],
            aliases: ["unmute-bot", "botunmute", "bot-unmute"],
            permLevel: 6,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Unmute a bot",
            usage: '(Member:member)'
        });
    }

    async run(message, [member]) {
      message.channel.send(`Enter a reason to unmute \`${member.user.tag}\` (20s)`)
      let f = m => m.author.id === message.author.id;
      let mgs = await message.channel.awaitMessages(f, { max: 1, time: 20000, errors: ['time'] });
      
      mgs = mgs.first().content;
      if (mgs.toLowerCase() === "cancel") return message.channel.send(`Cancelled mute`)
      await member.roles.remove(message.guild.roles.get("491232913086742544"));
      await member.roles.add(message.guild.roles.get("500654322355535872"));
      message.channel.send(`Unmted ${member.user}`)
      let o = await Manager.fetch(member.user.id)
      o = o.bot
      let e = new MessageEmbed()
        .setTitle('Bot Unmuted')
        .addField(`Bot`, `${member.user}`, true)
        .addField(`Owner`, `<@${o.owner}>`, true)
        .addField("Mod", message.author, true)
        .addField("Reason", mgs)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
        .setColor(0xffaa00)
        .setColor(0xffaa00)
      let mg = await modLog.send(`<@${o.owner}>`);
      mg.delete();
      modLog.send(e)
    }
  
    async init() {
      modLog = this.client.guilds.get("477792727577395210").channels.get("481845465298501632");
    }
};
