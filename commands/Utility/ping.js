const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'ping',
            enabled: true,
            runIn: ['text'],
            cooldown: 0,
            aliases: ["pong", "latency"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Check the bot's latency",
            quotedStringSupport: false,
            usage: '',
            usageDelim: undefined,
            extendedHelp: "This command is used to check if the bot is available. It also shows the connection speed between the bot and Discord."
        });
    }

    async run(message, [...params]) {
      message.channel.send(`Pong! Latency: \`${Math.floor(message.client.ping)}\`ms.`);
    }

};
