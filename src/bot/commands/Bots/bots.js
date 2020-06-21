const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: "[User:user]"
        });
    }

    async run(message, [user]) {
        let person = user ? user : message.author;

        let bots = await Bots.findOne({ botid: user.id }, { _id: false })
        bots = bots.filter(bot => bot.state !== "deleted" && bot.owners.includes(person.id));

        if (bots.length === 0) return message.channel.send(`\`${person.tag}\` has no bots. Add one: <${process.env.DOMAIN}/add/>.`)
        var cont = ``
        var un = false;
        for (let i = 0; i < bots.length; i++) {
            let bot = bots[i];
            if (bot.state == "unverified") {
                un = true
                cont += `~~<@${bot.id}>~~\n`
            } else cont += `<@${bot.id}>\n`
        }
        let e = new MessageEmbed()
            .setTitle(`${person.username}#${person.discriminator}'s bots`)
            .setDescription(cont)
            .setColor(0x6b83aa)
        if (un) e.setFooter(`Bots with strikethrough are unverified.`)
        message.channel.send(e)
    }

};