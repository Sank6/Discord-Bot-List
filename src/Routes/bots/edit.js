const { Router } = require("express");

const route = Router();

route.get("/:id", async (req, res, next) => {
    let bot = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id === req.params.id);

    if (!bot) return res.sendStatus(404);
    if (!bot.owners.includes(user.id)) return res.redirect(`/error?e=owner`);
    res.render("edit/index", { bot: bot });
});

module.exports = route;
