const { Event } = require('klasa');

module.exports = class extends Event {
    run(oldUser, newUser) {
        if (!oldUser.bot || oldUser.username === newUser.username) return;
        Bots.updateOne({ botid: newUser.id }, {$set: {username: newUser.username}});
    }
};