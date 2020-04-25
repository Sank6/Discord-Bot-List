const { Router } = require("express");
const { getUser } = require('@utils/discordApi')
const Bots = require("@models/bots");

const route = Router();

route.get("/", async (req, res, next) => {
    let token = req.cookies['refresh_token']
    let [user, tk] = await getUser(token);
    res.cookie("refresh_token", tk, {httpOnly: true})
    user = await req.app.get("client").users.cache.get(user.id);
    if (!user) return res.render("user/notfound", {});

    
    let bots = await Bots.find({}, { _id: false }).exec();
    bots = bots.filter(bot => bot.owners.includes(user.id))
    let data = {
        user: user,
        cards: bots
    };
    res.render("user/me", data);
});

module.exports = route;