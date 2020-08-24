const { Router } = require("express");
const { web: {domain_with_protocol}, discord_client: {id} } = require("@root/config.json");

const route = Router();

route.get("/", async (req, res, next) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${id}&response_type=code&scope=identify&redirect_uri=${encodeURIComponent(domain_with_protocol)}/api/callback`);
});

module.exports = route;
