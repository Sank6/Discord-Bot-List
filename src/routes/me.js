const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");

const { server: {admin_user_ids} } = require("@root/config.json")

const route = Router();

route.get("/", auth, async (req, res) => {
    let user = await req.app.get("client").users.fetch(req.user.id);
    if (!user) return res.render("user/notfound", {user: req.user});

    
    let bots = await Bots.find({}, { _id: false })
    bots = bots.filter(bot => {
        // Backward compaitibility
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        if (String(bot.owners).startsWith("["))
            owners = String(bot.owners).replace("[ '", "").replace("' ]", "").split("', '")
        return owners.includes(user.id)
    })

    res.render("user/me", {
        userProfile: user,
        cards: bots,
        admin: admin_user_ids.includes(user.id),
        moderator: req.user.staff,
        req
    });
});

module.exports = route;