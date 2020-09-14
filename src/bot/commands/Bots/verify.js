const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            permissionLevel: 8,
            usage: '[User:user]'
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot**.`);
        let bot = await Bots.findOne({botid: user.id}, { _id: false });

        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png"}))
            await Bots.updateOne({ botid: user.id }, {$set: {state: "verified", logo: botUser.displayAvatarURL({format: "png"})}});
        else 
            await Bots.updateOne({ botid: user.id }, {$set: { state: "verified" } })
        let e = new MessageEmbed()
            .setTitle('Bot Verified')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner`, `<@${bot.owners[0]}>`, true)
            .addField("Mod", message.author, true)
            .setThumbnail(botUser.displayAvatarURL({format: "png"}))
            .setTimestamp()
            .setColor(0x26ff00)
        modLog.send(e);
        modLog.send(`<@${bot.owners[0]}>`).then(m => { m.delete() });

        message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.owners[0])).then(owner => {
            owner.roles.add(message.guild.roles.cache.get(role_ids.bot_developer))
        })
        message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid)).then(bot => {
            bot.roles.set([role_ids.bot, role_ids.verified, role_ids.unmuted]);
        })
        message.channel.send(`Verified \`${bot.username}\``);
    }

    async init() {
        modLog = this.client.channels.cache.get(mod_log_id);
    }
};