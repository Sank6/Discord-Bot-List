const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["bot-info", "info"],
            usage: '[User:user]'
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to get info about.`);
        if (user.id === message.client.user.id) return message.channel.send(`-_- No`);

        let ans = JSON.parse(message.client.settings.get('bots')).find(u => u.id === user.id);
        console.log(ans);
        if (!ans) return message.channel.send(`Bot not found.`)
        let e = new MessageEmbed()
            .setColor(0x6b83aa)
            .setAuthor(ans.name, ans.logo, ans.invite)
            .setDescription(ans.description)
            .addField(`Prefix`, ans.prefix ? ans.prefix : "Unknown", true)
            .addField(`Owner`, `<@${ans.owners[0]}>`, true)
            .addField(`State`, ans.state.capitalize(), true)
        message.channel.send(e);
    }
};