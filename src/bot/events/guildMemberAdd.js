const { Event } = require('klasa');

const { server: {role_ids} } = require("@root/config.json");

module.exports = class extends Event {
    run(message, member) b
        const role = message.guild.roles.cache.find(role => role.name === 'Server Member')
        if(!member.user.bot) {
            if(!role) return;
            message.member.roles.add(role)
        }
        if (member.user.bot) {
            member.roles.add(member.guild.roles.cache.get(role_ids.bot));
            member.roles.add(member.guild.roles.cache.get(role_ids.unverified));
        }
    }
};
