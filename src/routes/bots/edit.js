const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");

const route = Router();

route.get("/:id", auth, async (req, res, next) => {
    let bot = await Bots.findOne({botid: req.params.id}, { _id: false, auth: false })

    if (!bot) return res.sendStatus(404);
    if (!bot.owners.includes(req.user.id)) return res.redirect(`/error?e=owner`);
    res.render("edit", { bot: bot });
});

module.exports = route;
