const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["nsfw", "toggle-nsfw", "togglensfw"],
            permissionLevel: 8,
            usage: "[User:user]"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to mark as nsfw.`);
        let bot = await Bots.findOne({botid: user.id});
        await Bots.updateOne({ botid: user.id }, {$set: { nsfw: !bot.nsfw } })
        message.channel.send(`👍 \`${user.tag}\` is marked as ${bot.nsfw ? "not" : ""} NSFW`)
    }
};