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
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        owners = await message.guild.members.fetch({user:owners})
        owners.forEach(o => {
            o.send(`Your bot \`${bot.username}\`is now being tested by ${message.author.tag}.`)
        })
       
        message.channel.send(`Testing \`${bot.username}\``);
    }

 
};
