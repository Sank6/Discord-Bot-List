// This is to force update, in case something didn't work
const { Command } = require('klasa');
var Manager = require('../../manage.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'update',
            runIn: ['text'],
            aliases: [],
            cooldown: 60,
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Update the bots in the server."
        });
    }

    async run(message) {
      let m = await message.channel.send(`Updating bots.`);
      await Manager.updateBots(this.client);
      m.edit(`Updated all bots.`);
    }
};
