const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'count',
            runIn: ['text'],
            aliases: ["list", "botcount", "bot-count"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Check how many bots there are in the list."
        });
    }

    async run(message) {
        let bots = await Bots.find({}, { _id: false })
        bots = bots.filter(bot => bot.state !== "deleted");
        if (bots.length === 1) message.channel.send(`There is \`1\` bot in the list.`)
        else message.channel.send(`There are \`${bots.length}\` bots in the list.`)
    }
};
