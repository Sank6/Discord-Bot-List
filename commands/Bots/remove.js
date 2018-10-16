const { Command } = require('klasa');
const Manager = require('../../manage.js');
const { MessageEmbed } = require('discord.js');

const reasons = {
  "1": `Your bot was offline when we tried to verify it.`,
  "2": `Your bot is a clone of another bot`,
  "3": `Your bot responds to other bots`,
  "4": `Your bot doesn't have any/enough working commands. (Minimum: 7)`,
  "5": `Your bot has NSFW commands that work in non-NSFW marked channels`,
  "6": `Your bot doesn't have a working help command or commands list`
}
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'remove',
            runIn: ['text'],
            aliases: ["delete"],
            permLevel: 6,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Remove a bot from the botlist",
            usage: '(Member:member)'
        });
    }

    async run(message, [member]) {
      
      let e2 = new MessageEmbed()
      .setTitle('Reasons')
      .setColor(0x6b83aa)
      .addField(`Removing bot`, `${member.user}`)
      let cont2 = ``;
      for (let k in reasons) {
        let r = reasons[k];
        cont2 += ` - **${k}**: ${r}\n`
      }
      cont2 += `\nEnter a valid reason number or your own reason.`
      e2.setDescription(cont2)
      message.channel.send(e2);
      let filter = m => m.author.id === message.author.id;
      message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
        .then(collected => {
          let reason = collected.first().content
          if (parseInt(reason)) {
            let r = reasons[reason]
            if (!r) return message.channel.send("Inavlid reason number.")
            Manager.remove(member.user.id).then(res => {
              console.log(res)
              if (res === false) return message.channel.send(`Unknown Error. Bot not found.`)
              let e = new MessageEmbed()
              .setTitle('Bot Removed')
              .addField(`Bot`, `<@${res.id}>`, true)
              .addField(`Owner`, `<@${res.owner}>`, true)
              .addField("Mod", message.author, true)
              .addField("Reason", r)
              .setThumbnail(res.logo)
              .setTimestamp()
              .setColor(0xffaa00)
              modLog.send(e)
              modLog.send(`<@${res.owner}>`).then(m => {m.delete()})
              message.channel.send(`Removed <@${res.id}> Check <#481845465298501632>.`)
              
              if (!message.client.users.find(u => u.id===res.id).bot) return;
              try {
                message.guild.fetchMember(message.client.users.find(u => u.id===res.id))
                  .then(bot => {bot.kick().then(() => {})
                  .catch(e => {console.log(e)})}).catch(e => {console.log(e)});
              } catch(e) {console.log(e)}
            })
          } else {
            let r = collected.first().content;
            if (r === "cancel") return message.channel.send(`Cancelled.`)
            Manager.remove(member.user.id).then(res => {
              let e = new MessageEmbed()
              .setTitle('Bot Removed')
              .addField(`Bot`, `<@${res.id}>`, true)
              .addField(`Owner`, `<@${res.owner}>`, true)
              .addField("Mod", message.author, true)
              .addField("Reason", r)
              .setThumbnail(res.logo)
              .setTimestamp()
              .setColor(0xffaa00)
              modLog.send(e)
              modLog.send(`<@${res.owner}>`).then(m => {m.delete()})
              message.channel.send(`Removed <@${res.id}> Check <#481845465298501632>.`)
              
              if (!message.client.users.find(u => u.id===res.id).bot) return;
                member.kick().then(() => {}).catch(e => {console.log(e)})
            })
          }
      })
    }
  
    async init() {
      modLog = this.client.guilds.get("477792727577395210").channels.get("481845465298501632");
    }
};
