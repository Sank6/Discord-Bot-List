const { Router } = require("express");
const { getUser } = require('@utils/discordApi.js');
const create = require('@utils/createAuth.js');
const Bots = require("@models/bots");

const { ADMIN_USERS } = process.env;

const route = Router();

route.get("/:id", async(req, res) => {
    let token = req.cookies["refresh_token"];
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })
    let [user, tk] = await getUser(token);
    res.cookie("refresh_token", tk, {httpOnly: true});
    
    const bot = await Bots.findOne({ botid: req.params.id }, { _id: false }).exec();
    if (bot.owner !== user.id && !ADMIN_USERS.split(' ').includes(user.id))
        return res.json({ "success": "false", "error": "Bot owner is not user." });

    
    let newAuthCode = create(20)
    await Bots.updateOne({ botid: user.id }, {$set: { auth: newAuthCode } })

    res.json({ "success": true, "auth": newAuthCode });
});

module.exports = route;
