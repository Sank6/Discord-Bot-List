const { Router } = require("express");
const { GUILD_INVITE } = process.env;

const route = Router();

route.get("/", async (req, res, next) => {
    res.redirect(GUILD_INVITE)
});

module.exports = route;
