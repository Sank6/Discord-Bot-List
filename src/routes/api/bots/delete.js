const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const { getUser } = require("@utils/discordApi.js");
const Bots = require("@models/bots");

const { server } = require("@root/config.json");

const route = Router();
route.use(bodyParser.urlencoded({extended: true}));

route.get("/:id", async (req, res) => {
    let {id} = req.params;

    let user;
    let {refresh_token, access_token} = req.cookies;
    if (!refresh_token) return res.json({ "success": "false", "error": "Invalid token" })

    let result = await getUser({access_token, refresh_token});
    if (!result) return res.redirect("/login");
    [user, {refresh_token, access_token}] = result;
    res.cookie("refresh_token", refresh_token, {httpOnly: true});
    res.cookie("access_token", access_token, {httpOnly: true});
    
    const bot = await Bots.findOne({ botid: id }, { _id: false })

    if (!bot) return res.sendStatus(404)
    if (user.message === "401: Unauthorized") return res.sendStatus(403)
    if (!bot.owners.includes(user.id) && server.admin_user_ids.includes(user.id)) return res.sendStatus(403)
    
    await Bots.deleteOne({ botid: id })

    req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${user.id}> has deleted <@${bot.botid}>`);
    req.app.get('client').guilds.cache.get(server.id).members.fetch(id).then(bot => {bot.kick()})
    res.sendStatus(200)
});

module.exports = route;
