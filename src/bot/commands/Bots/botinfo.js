const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");


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

        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (!bot) return message.channel.send(`Bot not found.`)
        let e = new MessageEmbed()
            .setColor(0x6b83aa)
            .setAuthor(bot.username, bot.logo, bot.invite)
            .setDescription(bot.description)
            .addField(`Prefix`, bot.prefix ? bot.prefix : "Unknown", true)
            .addField(`Owner`, `<@${bot.owners[0]}>`, true)
            .addField(`State`, bot.state, true)
        message.channel.send(e);
    }
};