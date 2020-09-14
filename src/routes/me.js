const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");

const { server: {admin_user_ids} } = require("@root/config.json")

const route = Router();

route.get("/", auth, async (req, res) => {
    let user = await req.app.get("client").users.fetch(req.user.id);
    if (!user) return res.render("user/notfound", {user: req.user});

    let bots = await Bots.find({}, { _id: false })
    bots = bots.filter(bot => bot.owners.includes(user.id))
    let data = {
        user: user,
        cards: bots,
        admin: admin_user_ids.includes(user.id),
        isProfile: true
    };
    res.render("user/me", data);
});

module.exports = route;