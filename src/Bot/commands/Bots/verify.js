const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
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
        let updated = JSON.parse(message.client.settings.get('bots'));
        updated.find(u => u.id === user.id).state = "verified";
        message.client.settings.update("bots", JSON.stringify(updated));
        let res = updated.find(u => u.id === user.id);
        let e = new MessageEmbed()
            .setTitle('Bot Verified')
            .addField(`Bot`, `<@${res.id}>`, true)
            .addField(`Owner`, `<@${res.owners[0]}>`, true)
            .addField("Mod", message.author, true)
            .setThumbnail(res.logo)
            .setTimestamp()
            .setColor(0x26ff00)
        modLog.send(e);
        modLog.send(`<@${res.owners[0]}>`).then(m => { m.delete() });

        message.guild.members.fetch(message.client.users.cache.find(u => u.id === res.owners[0])).then(owner => {
            owner.roles.add(message.guild.roles.cache.get(process.env.BOT_DEVELOPER_ROLE_ID))
        })
        message.guild.members.fetch(message.client.users.cache.find(u => u.id === res.id)).then(bot => {
            bot.roles.set([process.env.BOT_ROLE_ID, process.env.VERIFIED_ROLE_ID, process.env.UNMUTED_ROLE_ID]); // Bot and verified and Unmuted
        })
        message.channel.send(`Verified \`${res.name}\``);
    }

    async init() {
        modLog = this.client.channels.cache.get(process.env.MOD_LOG_ID);
    }
};