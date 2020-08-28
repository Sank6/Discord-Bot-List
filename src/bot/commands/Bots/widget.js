const { Command } = require('klasa');
const fetch = require('node-fetch');
const Bots = require("@models/bots");

const { web: {domain_with_protocol} } = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: '[User:user]'
        });
    }

    async run(message) {
    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!user.bot) return message.channel.send('Ping a **bot**')
        if(user.bot){
        let url = `${domain_with_protocol}/embed/${user.id}`
        let img = await fetch(url).then(res => res.buffer());
        message.channel.send({ files: [img] });
        }
    }

};
