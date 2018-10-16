const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
var Manager = require('../../manage.js');
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'verify',
            runIn: ['text'],
            aliases: [],
            permLevel: 6,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Verify a bot",
            usage: '(User:user)',
            usageDelim: undefined
        });
    }

    async run(message, [user]) {
      let u = user.id;
      if (!user.bot) return message.channel.send(`Ping a **bot**.`)
      Manager.verify(u).then(res => {
        let e = new MessageEmbed()
          .setTitle('Bot Verified')
          .addField(`Bot`, `<@${res.id}>`, true)
          .addField(`Owner`, `<@${res.owner}>`, true)
          .addField("Mod", message.author, true)
          .setThumbnail(res.logo)
          .setTimestamp()
          .setColor(0x26ff00)
        modLog.send(e);
        modLog.send(`<@${res.owner}>`).then(m => {m.delete()});
        
        message.guild.members.fetch(message.client.users.find(u => u.id === res.owner)).then(owner => {
          owner.roles.add(message.guild.roles.get("482883261639557131"))
        })
        message.guild.members.fetch(message.client.users.find(u => u.id === res.id)).then(bot => {
          bot.roles.set(["482882920894300160", "482882854175637504", "500654322355535872"]); // Bot and verified and Unmuted
        })
        message.channel.send(`Verified \`${res.name}\``);
      })
    }
  
    async init() {
      modLog = this.client.guilds.get("477792727577395210").channels.get("481845465298501632");
    }
};
