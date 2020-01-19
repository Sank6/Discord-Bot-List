const { Router } = require("express");
const { getUser } = require('@utils/discordApi.js');
const create = require('@utils/createAuth.js');

const route = Router();

route.get("/:id", async (req, res, next) => {
    let token = req.cookies["refresh_token"];
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user, tk] = await getUser(token);
    res.cookie("refresh_token", tk, {httpOnly: true});
    let bot = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id === req.params.id);

    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });
    if (!bot.owners.includes(user.id) && process.env.ADMIN_USERS.split(' ').includes(user.id)) return res.json({ "success": "false", "error": "Bot owner is not user." });
    if (!bot.auth) {
        let updated = JSON.parse(req.app.get('client').settings.get('bots'));
        updated.find(u => u.id === req.params.id).auth = create(20);
        req.app.get('client').settings.update("bots", JSON.stringify(updated));
        res.json({ "success": true, "auth": updated.find(u => u.id === req.params.id).auth });
    } else {
        res.json({ "success": true, "auth": bot.auth });
    }
});

module.exports = route;
