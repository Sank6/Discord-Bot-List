const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");
const Users = require("@models/users");

const { web: { recaptcha_v2: { site_key } } } = require("@root/config.json");

const route = Router();

route.get("/:id", async (req, res) => {
    let bot = await Bots.findOne({ botid: req.params.id }, { _id: false, auth: false })
    if (req.user) {
        let users = await Users.findOne({ userid: req.user.id }, { _id: false, auth: false });
        if (!bot) return res.sendStatus(404);
        //if (!req.user) return res.redirect(`/login`);
        let theme = "light";
        if (req.cookies["theme"] === "dark") theme = "dark"
        res.render("vote", { bot: bot, user: req.user, theme, site_key, users: users });
    } else {
        if (!bot) return res.sendStatus(404);
        //if (!req.user) return res.redirect(`/login`);
        let theme = "light";
        if (req.cookies["theme"] === "dark") theme = "dark"
        res.render("vote", { bot: bot, user: req.user, theme, site_key });
    }
});

module.exports = route;