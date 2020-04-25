const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const { getUser } = require("@utils/discordApi.js");
const Bots = require("@models/bots");

const { ADMIN_USERS, GUILD_ID, MOD_LOG_ID } = process.env;

const route = Router();
route.use(bodyParser.urlencoded({extended: true}));

route.post("/", async (req, res) => {
    let data = req.body;

    let [user, tk] = await getUser(req.cookies["refresh_token"]);
    res.cookie('refresh_token', tk, {httpOnly: true});
    
    const bot = await Bots.findOne({ botid: data.id }, { _id: false }).exec();

    if (!bot) return res.redirect("/error?e=notfound")
    if (user.message === "401: Unauthorized") return res.redirect("/error?e=user")
    if (!bot.owners.includes(user.id) && ADMIN_USERS.split(' ').includes(user.id)) return res.redirect(`/error?e=owner`);
    if (bot.id !== data.id) return res.redirect(`/error?e=id`);
    if (data.short.length >= 120) return res.redirect(`/error?e=long`)
    if (is(data.long) || is(data.short)) return res.redirect(`/error?e=html`);

    let { long, short, link, prefix } = data;
    await Bots.updateOne({ botid: data.id }, {$set: { long, short, link, prefix } })

    req.app.get('client').guilds.get(GUILD_ID).channels.find(c => c.id === MOD_LOG_ID).send(`<@${user.id}> has updated <@${bot.id}>`)
    res.redirect(`/bots/${bot.id}`);
});

module.exports = route;
