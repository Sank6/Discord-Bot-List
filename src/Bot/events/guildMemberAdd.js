const { Event } = require('klasa');

module.exports = class extends Event {
    run(member) {
        if (member.user.bot) {
            member.roles.add(member.guild.roles.get(process.env.BOT_ROLE_ID));
            member.roles.add(member.guild.roles.get(process.env.UNVERIFIED_ROLE_ID));
        }
    }
};