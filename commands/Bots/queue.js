const { Command } = require('klasa');
//var Manager = require('../../manage.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["q"],
            permLevel: 8
        });
    }

    async run(message) {
        let e = new MessageEmbed()
            .setTitle('Queue')
            .setColor(0x6b83aa)
        let cont = "";

        let res = JSON.parse(message.client.settings.get('bots')).filter(u => u.state === "unverified");

        res.forEach(bot => { cont += `<@${bot.id}> : [Invite](https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&guild_id=${process.env.GUILD_ID}&permissions=0)\n` })
        if (res.length === 0) e.setDescription("Queue is empty")
        else e.setDescription(cont)
        message.channel.send(e)
    }
};