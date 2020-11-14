const { Event } = require('klasa');
const Bots = require("@models/bots");
const { server: {id} } = require("@root/config.json");

module.exports = class extends Event {
    async run(member) {
        let bots = await Bots.find({ owners: member.id, state: { $ne: "deleted" } }, { _id: false });
        if (bots.length === 0) return;
        for (let i = 0; i < bots.length; i++) {
            let bot = bots[i];
            await Bots.updateOne({ botid: bot.botid }, { $set: { state: "deleted" } });
            const botCheck = await this.client.guilds.cache.get(id).members.cache;
            if (botCheck.has(bots.id)) {
                this.client.users.cache.get(bots.id).then(bot => bot.kick());
            }
        }
    }
};
