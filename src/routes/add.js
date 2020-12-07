const { Router } = require("express");
const { auth } = require('@utils/discordApi');

const { web: {recaptcha_v2: {site_key}}, bot_options: {bot_tags} } = require("@root/config.json");

const route = Router();

route.get("/", auth, async (req, res) => {
    res.render("add", {
        bot_tags,
        site_key,
        req
    })
});

module.exports = route;
