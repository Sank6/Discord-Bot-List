const { Command } = require('klasa');
Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
}

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            permLevel: 8,
            botPerms: ["SEND_MESSAGES"],
            description: "Update the bots in the server."
        });
    }

    async run(message) {
        let m = await message.channel.send(`Updating bots.`);
        try {
            await this.update(message.client);
        } catch (e) { console.error(e) }
        m.edit(`Updated all bots.`);
    }

    async update(client) {
        let bots = JSON.parse(client.settings.get('bots'));
        for (let bot of bots) {
            let botUser = client.users.get(bot.id);
            if (!botUser) bots = bots.remove(bot)
            else {
                bot.logo = `/avatar/?avatar=${encodeURIComponent(botUser.displayAvatarURL())}`;
                bot.name = botUser.username;
            }
        }
        await client.settings.update("bots", JSON.stringify(bots));
        return true;
    }
};