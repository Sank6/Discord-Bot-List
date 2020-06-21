const { Router } = require("express");
const { getUser } = require('@utils/discordApi')
const Bots = require("@models/bots");

const route = Router();

route.get("/", async (req, res, next) => {
    let user;
    let {refresh_token, access_token} = req.cookies;
    let result = await getUser({access_token, refresh_token});
    if (!result) return res.redirect("/login");
    [user, {refresh_token, access_token}] = result;
    res.cookie("refresh_token", refresh_token, {httpOnly: true})
    res.cookie("access_token", access_token, {httpOnly: true})

    user = await req.app.get("client").users.cache.get(user.id);
    if (!user) return res.render("user/notfound", {});

    
    let bots = await Bots.find({}, { _id: false })
    bots = bots.filter(bot => bot.owners.includes(user.id))
    let data = {
        user: user,
        cards: bots
    };
    res.render("user/me", data);
});

module.exports = route;