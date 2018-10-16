const { Command } = require('klasa');
var Manager = require('../../manage.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'queue',
            runIn: ['text'],
            aliases: ["q"],
            permLevel: 6,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Get the bot queue"
        });
    }

    async run(message) {
      let e = new MessageEmbed()
        .setTitle('Queue')
        .setColor(0x6b83aa)
      let cont = "";
      Manager.queue().then(res => {
        res.forEach(bot => {cont += `<@${bot.id}> : [Invite](https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&guild_id=477792727577395210&permissions=0)\n`})
        if (res.length === 0) e.setDescription("Queue is empty")
        else e.setDescription(cont)
        message.channel.send(e)
      });
    }
};
