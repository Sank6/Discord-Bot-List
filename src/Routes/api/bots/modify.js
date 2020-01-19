const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const { getUser } = require("@utils/discordApi.js");

const { ADMIN_USERS, GUILD_ID, MOD_LOG_ID } = process.env;

const route = Router();
route.use(bodyParser.urlencoded({extended: true}));

route.post("/", async (req, res, next) => {
    let data = req.body;

    let [user, tk] = await getUser(req.cookies["refresh_token"]);
    res.cookie('refresh_token', tk, {httpOnly: true});
    
    let bot = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id === data.id);

    if (!bot) return res.redirect("/error?e=wot")
    if (user.message === "401: Unauthorized") return res.redirect("/error?e=user")
    if (!bot.owners.includes(user.id) && ADMIN_USERS.split(' ').includes(user.id)) return res.redirect(`/error?e=owner`);
    if (bot.id !== data.id) return res.redirect(`/error?e=id`);
    if (data.short.length >= 120) return res.redirect(`/error?e=long`)
    if (is(data.long) || is(data.short)) return res.redirect(`/error?e=html`);

    let updated = JSON.parse(req.app.get('client').settings.get('bots'));
    updated.find(u => u.id === data.id).long = data.long;
    updated.find(u => u.id === data.id).description = data.short;
    updated.find(u => u.id === data.id).invite = data.link;
    updated.find(u => u.id === data.id).prefix = data.prefix;
    req.app.get('client').settings.update("bots", JSON.stringify(updated));

    req.app.get('client').guilds.get(GUILD_ID).channels.find(c => c.id === MOD_LOG_ID).send(`<@${user.id}> has updated <@${bot.id}>`)
    res.redirect(`/bots/${bot.id}`);
});

module.exports = route;
