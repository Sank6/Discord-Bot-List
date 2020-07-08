const { Router } = require("express");
const { getUser } = require('@utils/discordApi')
const Bots = require("@models/bots");

const route = Router();

route.get("/:id", async (req, res, next) => {
    let user;
    let {refresh_token, access_token} = req.cookies;
    if (!refresh_token) return res.json({ "success": "false", "error": "Invalid token" })

    let result = await getUser({access_token, refresh_token});
    if (!result) return res.redirect("/login");
    [user, {refresh_token, access_token}] = result;
    res.cookie("refresh_token", refresh_token, {httpOnly: true});
    res.cookie("access_token", access_token, {httpOnly: true});

    let bot = await Bots.findOne({botid: req.params.id}, { _id: false, auth: false })

    if (!bot) return res.sendStatus(404);
    if (!bot.owners.includes(user.id)) return res.redirect(`/error?e=owner`);
    res.render("edit", { bot: bot });
});

module.exports = route;
