const { Router } = require("express");
const { getUser } = require("@utils/discordApi");
const btoa = require('btoa');
const fetch = require('node-fetch');
const { CLIENT_ID, CLIENT_SECRET, DOMAIN } = process.env;

const route = Router();

route.get("/", async (req, res, next) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/v6/oauth2/token?grant_type=authorization_code&code=${code}&scope=identify&redirect_uri=${encodeURIComponent(DOMAIN)}/api/callback`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
        },
    });
    const json = await response.json();

    const [{ username, discriminator, avatar, id }, tk] =  await getUser(json.refresh_token);
    if (!id) return res.redirect('/login');
    res.cookie("refresh_token", tk, {httpOnly: true})
    res.cookie("theme", "light");
    res.cookie("avatar", avatar);
    res.cookie("userid", id);
    res.cookie("username", username);
    res.cookie("discriminator", discriminator);
    res.redirect(`/`);
});

module.exports = route;
