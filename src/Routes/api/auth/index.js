const { Router } = require("express");
const { getUser } = require('@utils/discordApi.js');
const create = require('@utils/createAuth.js');
const Bots = require("@models/bots");

const route = Router();

route.get("/:id", async (req, res, next) => {
    let token = req.cookies["refresh_token"];
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user, tk] = await getUser(token);
    res.cookie("refresh_token", tk, {httpOnly: true});
    const bot = await Bots.findOne({ botid: req.params.id }, { _id: false }).exec();
    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });
    if (!bot.owners.includes(user.id) && !process.env.ADMIN_USERS.split(' ').includes(user.id)) return res.json({ "success": "false", "error": "Bot owner is not user." });
    if (!bot.auth) {
        let newAuthCode = create(20)
        await Bots.updateOne({ botid: bot.id }, {$set: { auth: newAuthCode } })
        res.json({ "success": true, "auth": newAuthCode });
    } else {
        res.json({ "success": true, "auth": bot.auth });
    }
});

module.exports = route;
