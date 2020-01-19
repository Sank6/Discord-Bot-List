const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            botPerms: ["SEND_MESSAGES"],
            description: "Repeat",
            usage: '(String:string)'
        });
    }

    async run(message, [string]) {
        message.channel.send(string);
    }
};