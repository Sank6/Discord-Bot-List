// This is basically whenever something goes wrong

const { Command } = require('klasa');
var Manager = require('../../manage.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'owner',
            runIn: ['text'],
            aliases: [],
            permLevel: 6,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Assign an owner to a bot."
        });
    }

    async run(message) {
        let u7 = message.mentions.users.array()[0];
        let u8 = message.mentions.users.array()[1];
        if (u8.bot && !u7.bot) {
            let oldu7 = u7;
            let oldu8 = u8;
            u7 = oldu8;
            u8 = oldu7;
        }
        if (!u7 || !u8) return message.channel.send(`Ping a bot and an owner to set to.`)
        await Manager.owner(u7.id, u8.id)
        message.channel.send(`👍 All good! (Bot: \`${u7.tag}\`, Owner: \`${u8.tag}\`)`)
    }
};