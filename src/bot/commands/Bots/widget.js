const { Command } = require('klasa');
const fetch = require('node-fetch');
const Bots = require("@models/bots");


module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: '[User:user]'
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`You didn't ping a bot to get a widget of.`);
        let url = `${process.env.DOMAIN}/embed/${user.id}`
        let img = await fetch(url).then(res => res.buffer());
        message.channel.send({ files: [img] });
    }

};