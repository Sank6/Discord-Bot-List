
const { Client, Schema } = require('klasa');

Client.defaultPermissionLevels
    .add(8, ({ c, author }) => process.env.ADMIN_USERS.split(' ').includes(author.id));

const client = new Client({
    commandEditing: true,
    prefix: process.env.PREFIX,
    production: true,
    consoleEvents: {
        log: false,
        error: false,
        warn: false
    },
    disabledCorePieces: ["commands"]
});

module.exports.init = async (token) => {
    client.userBaseDirectory = __dirname;
    await client.login(token);
    return client;
}
