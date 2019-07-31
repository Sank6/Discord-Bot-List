const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: "[User:user]"
        });
    }

    async run(message, [user]) {
        let person = user ? user : message.author;

        let bts = JSON.parse(message.client.settings.get('bots')).filter(u => u.owners.includes(person.id));

        if (bts.length === 0) return message.channel.send(`\`${person.tag}\` has no bots. Add one: <${process.env.DOMAIN}/add/>.`)
        var cont = ``
        var un = false;
        for (let i = 0; i < bts.length; i++) {
            let bot = bts[i];
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