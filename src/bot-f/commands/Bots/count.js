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
        let bots = await Bots.findOne({ botid: user.id }, { _id: false }).exec();
        bots = bots.filter(bot => !bot.state == "deleted");
        message.channel.send(`There are \`${bots.length}\` bots in the list.`)
    }
};
