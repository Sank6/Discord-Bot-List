const { Router } = require("express");
const { CLIENT_ID, DOMAIN } = process.env;

const route = Router();

route.get("/", async (req, res, next) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=identify&redirect_uri=${encodeURIComponent(DOMAIN)}/api/callback`);
});

module.exports = route;
