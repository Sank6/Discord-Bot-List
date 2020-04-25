const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["nsfw", "mark"],
            permissionLevel: 8,
            usage: "[User:user]"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to mark as nsfw.`);
        await Bots.updateOne({ botid: user.id }, {$set: { nsfw: false } })
        message.channel.send(`👍 \`${user.tag}\` is now marked as NSFW`)
    }
};