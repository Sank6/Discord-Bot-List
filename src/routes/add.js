const { Router } = require("express");
const { auth } = require('@utils/discordApi');

const { web: {recaptcha_v2: {site_key}}, bot_options: {bot_tags, max_bot_tags} } = require("@root/config.json");

const route = Router();

route.get("/", auth, async (req, res) => {
    let theme = "light";
    if (req.cookies["theme"] === "dark") theme = "dark"
    res.render("add", {user: req.user, tags: bot_tags, count: max_bot_tags, theme, site_key})
});

module.exports = route;
