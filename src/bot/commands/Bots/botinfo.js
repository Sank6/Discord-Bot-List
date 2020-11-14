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
        if (!bot) return message.channel.send(`Bot not found.`);

        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png"}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png"})}});
        let e = new MessageEmbed()
            e.setColor(0x6b83aa)
            e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png"}), bot.invite)
            e.setDescription(bot.description)
            e.addField(`Prefix`, bot.prefix ? bot.prefix : "Unknown", true)
            if (typeof bot.vote === 'undefined' || bot.vote === null) {
                e.addField(`Vote`, `0 Votes`, true)
            } else {
                e.addField(`Vote`, `${bot.vote} Votes`, true)
            }
            e.addField(`Owner`, `<@${bot.owners.primary}>`, true)
            e.addField(`State`, bot.state, true)
        message.channel.send(e);
    }
};
