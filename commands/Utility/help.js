// This is just to disable automatic help command
const { Command } = require('klasa');
module.exports = class extends Command {
    constructor(...args) {super(...args, {});}
    async run(message) {}
};
