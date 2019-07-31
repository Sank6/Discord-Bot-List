const { Command } = require('klasa');
//var Manager = require('../../manage.js');

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
        let ans = JSON.parse(message.client.settings.get('bots'));
        message.channel.send(`There are \`${ans.length}\` bots in the list.`)
    }
};