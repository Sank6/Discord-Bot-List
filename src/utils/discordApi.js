const fetch = require('node-fetch');

const { server: { role_ids: { bot_verifier } }, server: { admin_user_ids, id } } = require("@root/config.json")

module.exports.auth = async(req, res, next) => {
    if (!req.user) return res.redirect("/login");
    
    req.user.staff = false;

    try {
        const member = await req.app.get('client').guilds.cache.get(id).members.fetch(req.user.id);
        if (admin_user_ids.includes(req.user.id) || member.roles.cache.has(bot_verifier))
            req.user.staff = true
    } catch(_) {}

    return next();
}

module.exports.getUser = async (user) => {
    let { accessToken } = user;

    user = await fetch(`https://discord.com/api/users/@me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    user = await user.json();

    if (user.code === 0) return false;
    return user;
};