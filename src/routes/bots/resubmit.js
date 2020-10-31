const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");

const { web: {recaptcha_v2: {site_key}} } = require("@root/config.json");

const route = Router();

route.get("/:id", auth, async (req, res) => {
    let bot = await Bots.findOne({botid: req.params.id}, { _id: false })

    if (!bot) return res.sendStatus(404);
    if (bot.state !== "deleted") return res.sendStatus(404);
    let theme = "light";
    if (req.cookies["theme"] === "dark") theme = "dark"
    res.render("resubmit", { bot: bot, user: req.user, theme, site_key });
});

module.exports = route;
