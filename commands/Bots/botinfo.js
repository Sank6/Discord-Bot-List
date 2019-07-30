const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
var Manager = require('../../manage.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'botinfo',
            runIn: ['text'],
            aliases: ["bot-info", "info"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Get information for a bot",
            usage: '(User:user)',
            usageDelim: undefined
        });
    }

    async run(message, [user]) {
        if (!user.bot) return message.channel.send(`Ping a **bot** to get info about.`);
        if (message.client.isMentioned) return message.channel.send(`-_- No`);

        let ans = await Manager.fetch(user.id)
        if (ans === false) return message.channel.send(`Bot not found.`)
        ans = ans.bot;
        let e = new MessageEmbed()
            .setColor(0x6b83aa)
            .setAuthor(ans.name, ans.logo, ans.invite)
            .setDescription(ans.description)
            .addField(`Prefix`, ans.prefix, true)
            .addField(`Owner`, `<@${ans.owner}>`, true)
            .addField(`State`, ans.state.capitalize(), true)
        message.channel.send(e);
    }
};