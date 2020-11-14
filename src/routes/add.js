const { Router } = require("express");
const { auth } = require('@utils/discordApi');

const { web: {recaptcha_v2: {site_key}} } = require("@root/config.json");

const route = Router();

route.get("/", auth, async (req, res) => {
    let theme = "light";
    if (req.cookies["theme"] === "dark") theme = "dark"
    res.render("add", {user: req.user, theme, site_key})
});

module.exports = route;