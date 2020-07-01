const unirest = require("unirest");
const fetch = require('node-fetch');
const { CLIENT_ID, CLIENT_SECRET, DOMAIN } = process.env;

module.exports.refreshUser = async(opts) => {
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("redirect_uri", `${DOMAIN}/api/callback`);
    params.append("scope", "identify");

    if (opts.code) {
        params.append("grant_type", "authorization_code");
        params.append("code", opts.code);
    } else if (opts.refresh_token) {
        params.append("grant_type", "refresh_token");
        params.append("code", opts.refresh_token);
    }

    const response = await fetch(`https://discord.com/api/v6/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    });
    let json = await response.json();
    
    return json;
}

module.exports.getUser = async (opts) => {
    let access_token, refresh_token;
    if (!opts.access_token) {
        let json = await module.exports.refreshUser(opts);
        access_token = json.access_token;
        refresh_token = json.refresh_token
    } else {
        access_token = opts.access_token;
        refresh_token = opts.refresh_token;
    }

    let data = [];
    let user = await fetch(`https://discord.com/api/users/@me`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    user = await user.json();

    if (user.code === 0) return false;
    data.push(user);
    data.push({refresh_token, access_token});
    return data;
};

module.exports.getBot = (id) => {
    return new Promise(function (resolve, reject) {
        let data = [];
        unirest
            .get(`https://discord.com/api/users/${id}`)
            .headers({
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            })
            .end(function (user) {
                if (user["raw_body"].error) return resolve(false);
                data.push(JSON.parse(user["raw_body"]));
                resolve(data);
            });
    });
};
