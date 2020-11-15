const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");

const { web: {recaptcha_v2: {site_key}} } = require("@root/config.json");

const route = Router();

route.get("/:id", auth, async (req, res) => {
    let bot = await Bots.findOne({botid: req.params.id}, { _id: false, auth: false })

    if (!bot) return res.render(404);

    // Backward compaitibility
    let owners = [bot.owners.primary].concat(bot.owners.additional)
    if (String(bot.owners).startsWith("["))
        owners = String(bot.owners).replace("[ '", "").replace("' ]", "").split("', '")
    
    if (!owners.includes(req.user.id)) return res.render(403);
    let theme = "light";
    if (req.cookies["theme"] === "dark") theme = "dark"
    res.render("edit", { bot: bot,user: req.user, isBotEditPage: true, theme, site_key });
});

module.exports = route;
