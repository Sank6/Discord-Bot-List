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

module.exports.getBot = (id) => {
    return new Promise(function (resolve, reject) {
        let data = [];
        unirest
            .get(`https://discord.com/api/users/${id}`)
            .headers({
                Authorization: `Bot ${token}`,
            })
            .end(function (user) {
                if (user["raw_body"].error) return resolve(false);
                data.push(JSON.parse(user["raw_body"]));
                resolve(data);
            });
    });
};
