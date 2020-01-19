const { Router } = require("express");

const route = Router();

route.get("/:id", async (req, res, next) => {
    let user = req.app.get('client').users.get(req.params.id);
    if (!user) return res.render("user/notfound", {})

    let bots = JSON.parse(req.app.get('client').settings.get('bots')).filter(b => b.owners.includes(req.params.id));

    if (bots.length === 0) return res.render("user/notfound", {})
    let data = {
        user: user,
        cards: bots
    }
    res.render("user/index", data);
});

module.exports = route;
