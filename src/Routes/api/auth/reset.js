const { Router } = require("express");
const { getUser } = require('@utils/discordApi.js');
const create = require('@utils/createAuth.js');

const { ADMIN_USERS } = process.env;

const route = Router();

route.get("/:id", async(req, res) => {
    let token = req.cookies["refresh_token"];
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user, tk] = await getUser(token);
    res.cookie("refresh_token", tk, {httpOnly: true});
    let bot = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id === req.params.id);
    if (bot.owner !== user.id && ADMIN_USERS.split(' ').includes(user.id))
        return res.json({ "success": "false", "error": "Bot owner is not user." });

    let updated = JSON.parse(req.app.get('client').settings.get('bots'));
    let newAuth = create(20);
    updated.find(u => u.id === req.params.id).auth = newAuth;
    req.app.get('client').settings.update("bots", JSON.stringify(updated));

    res.json({ "success": true, "auth": newAuth });
});

module.exports = route;
