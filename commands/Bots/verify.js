const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
var Manager = require('../../manage.js');
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'verify',
            runIn: ['text'],
            aliases: [],
            permLevel: 6,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Verify a bot",
            usage: '(User:user)',
            usageDelim: undefined
        });
    }

    async run(message, [user]) {
        let u = user.id;
        if (!user.bot) return message.channel.send(`Ping a **bot**.`)
        let res = await Manager.verify(u)
        let e = new MessageEmbed()
            .setTitle('Bot Verified')
            .addField(`Bot`, `<@${res.id}>`, true)
            .addField(`Owner`, `<@${res.owner}>`, true)
            .addField("Mod", message.author, true)
            .setThumbnail(res.logo)
            .setTimestamp()
            .setColor(0x26ff00)
        modLog.send(e);
        modLog.send(`<@${res.owner}>`).then(m => { m.delete() });

        message.guild.members.fetch(message.client.users.find(u => u.id === res.owner)).then(owner => {
            owner.roles.add(message.guild.roles.get(process.env.BOT_DEVELOPER_ROLE_ID))
        })
        message.guild.members.fetch(message.client.users.find(u => u.id === res.id)).then(bot => {
            bot.roles.set([process.env.BOT_ROLE_ID, process.env.VERIFIED_ROLE_ID, process.env.UNMUTED_ROLE_ID]); // Bot and verified and Unmuted
        })
        message.channel.send(`Verified \`${res.name}\``);

    }

    async init() {
        modLog = this.client.guilds.get(process.env.GUILD_ID).channels.get(process.env.MOD_LOG_ID);
    }
};