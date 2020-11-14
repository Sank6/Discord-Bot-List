const unirest = require("unirest");
const fetch = require('node-fetch');

const { discord_client: {token} } = require("@root/config.json");

module.exports.auth = async(req, res, next) => {
    if (!req.user) return res.redirect("/login");
    else return next();
}

module.exports.getUser = async (user) => {
    let { accessToken } = user;

    user = await fetch(`https://discord.com/api/users/@me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    user = await user.json();

    if (user.code === 0) return false;
    return user;
};