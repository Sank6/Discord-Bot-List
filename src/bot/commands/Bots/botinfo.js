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
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        let e = new MessageEmbed()
            e.setColor(0x6b83aa)
            e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png", size: 256}), bot.invite)
            e.setDescription(bot.description)
            e.addField(`Prefix`, bot.prefix ? bot.prefix : "Unknown", true)
            if (typeof bot.support === 'undefined' || bot.support === null) {
                e.addField(`Support Server`, `Not Added`, true)
            } else {
                e.addField(`Support Server`, `[Click Here](${bot.support})`, true)
            }
            if (typeof bot.website === 'undefined' || bot.website === null) {
                e.addField(`Website`, `Not Added`, true)
            } else {
                e.addField(`Website`, `[Click Here](${bot.website})`, true)
            }
            if (typeof bot.github === 'undefined' || bot.github === null) {
                e.addField(`Github`, `Not Added`, true)
            } else {
                e.addField(`Github`, `[Click Here](${bot.github})`, true)
            }
            if (typeof bot.likes === 'undefined' || bot.likes === null) {
                e.addField(`Like`, `0 Likes`, true)
            } else {
                e.addField(`Like`, `${bot.likes} Likes`, true)
            }
            e.addField(`Owner`, `<@${bot.owners.primary}>`, true)
            e.addField(`State`, bot.state, true)
        message.channel.send(e);
    }
};
