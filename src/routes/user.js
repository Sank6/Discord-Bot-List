const { Router } = require("express");
const Bots = require("@models/bots");

const { server: {admin_user_ids} } = require("@root/config.json")

const route = Router();

route.get("/:id", async (req, res) => {
    let user = await req.app.get('client').users.fetch(req.params.id)
        .catch(_ => res.render("404", {req}));
    if (!user) return;

    let bots = await Bots.find({}, { _id: false })
    bots = bots.filter(bot => [bot.owners.primary].concat(bot.owners.additional).includes(user.id))
    
    if (bots.length === 0) return res.render("user/notfound", {user: req.user})
    
    res.render("user/index", {
        userProfile: user,
        cards: bots,
        admin: admin_user_ids.includes(req.params.id),
        req
    });
});

module.exports = route;
