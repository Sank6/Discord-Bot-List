const { Router } = require("express");
const { getUser } = require('@utils/discordApi')
const Bots = require("@models/bots");

const route = Router();

route.get("/:id", async (req, res, next) => {
    let token = req.cookies['refresh_token']
    let [user, tk] = await getUser(token);

    let bot = await Bots.findOne({botid: req.params.id}, { _id: false, auth: false }).exec();

    if (!bot) return res.sendStatus(404);
    if (!bot.owners.includes(user.id)) return res.redirect(`/error?e=owner`);
    res.render("edit/index", { bot: bot });
});

module.exports = route;
