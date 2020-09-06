const { Router } = require("express");
const Bots = require("@models/bots");

const { server: {admin_user_ids} } = require("@root/config.json")

const route = Router();

route.get("/:id", async (req, res, next) => {
    let user = req.app.get('client').users.cache.get(req.params.id);
    if (!user) return res.render("user/notfound", {user: req.user})

    let bots = await Bots.find({}, { _id: false })
    bots = bots.filter(bot => bot.owners.includes(user.id))
    
    if (bots.length === 0) return res.render("user/notfound", {user: req.user})
    let data = {
        user: user,
        cards: bots,
        admin: admin_user_ids.includes(req.params.id),
        isProfile: true
    }
    res.render("user/index", data);
});

module.exports = route;
