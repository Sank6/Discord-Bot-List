const { Command } = require('klasa');
const Bots = require("@models/bots");

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
        let bots = await Bots.find({}, { _id: false })
        let updates = []
        for (let bot of bots) {
            let botUser = client.users.cache.get(bot.id);
            if (!botUser) 
                updates.push({updateOne: {filter: {botid: bot.id}, update: { state: "deleted", owners: {primary: bot.owners.primary, additional: []} }}})
            if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
                updates.push({updateOne: {filter: {botid: bot.id}, update: { logo: botUser.displayAvatarURL({format: "png", size: 256})}}});
            if (bot.username !== botUser.username)
                updates.push({updateOne: {filter: {botid: bot.id}, update: { username: botUser.username }}})
        }
        await Bots.bulkWrite(updates)
        return true;
    }
};
