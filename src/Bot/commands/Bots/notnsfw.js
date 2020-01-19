const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            permissionLevel: 8,
            usage: "[User:user]"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to mark as nsfw.`);

        let updated = JSON.parse(message.client.settings.get('bots'));
        updated.find(u => u.id === user.id).nsfw = false;
        message.client.settings.update("bots", JSON.stringify(updated));

        message.channel.send(`👍 \`${user.tag}\` is now marked as SFW`)
    }
};