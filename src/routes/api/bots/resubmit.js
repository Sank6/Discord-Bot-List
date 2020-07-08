const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const { getUser, getBot } = require('@utils/discordApi');
const { BOT_VERIFIERS_ROLE_ID, MOD_LOG_ID, GUILD_ID } = process.env;
const Bots = require("@models/bots");

const route = Router();
route.use(bodyParser.json({limit: '50mb'}));

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

route.post("/", async (req, res, next) => {
    let data = req.body;
    if (data.short.length > 120) return res.json({"redirect": "/error?e=long"});

    
    let user;
    let {refresh_token, access_token} = req.cookies;
    if (!refresh_token) return res.json({ "success": "false", "error": "Invalid token" })

    let result = await getUser({access_token, refresh_token});
    if (!result) return res.redirect("/login");
    [user, {refresh_token, access_token}] = result;
    res.cookie("refresh_token", refresh_token, {httpOnly: true});
    res.cookie("access_token", access_token, {httpOnly: true});
    
    let memberCheck = req.app.get('client').guilds.cache.get(GUILD_ID).member(user.id);

    let [bot] = await getBot(data.id);
    if (user.message === "401: Unauthorized") return res.json({"redirect": "/error?e=user"})
    if (memberCheck == null) return res.json({"redirect": "/error?e=server"})
    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake.")) return res.json({"redirect": "/error?e=unknown"})
    if (bot.message == "Unknown User") return res.json({"redirect": "/error?e=unknown"})
    if (bot.bot !== true) return res.json({"redirect": "/error?e=human"});
    if (is(data.long) || is(data.short)) return res.json({"redirect": "/error?e=html"});

    let owners = [user.id];
    owners = owners.concat(data.owners.replace(',', '').split(' ').remove(''));

    let original = await Bots.findOne({botid: bot.id});
    if (!original || original.state !== "deleted") return res.json({"redirect": "/error?e=unknown"})

    await Bots.updateOne({botid: bot.id}, {
        username: bot.username,
        logo: `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`,
        invite: data.invite,
        description: data.short,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owners
    });
    try {
        let r = req.app.get('client').guilds.cache.get(GUILD_ID).roles.cache.find(r => r.id === BOT_VERIFIERS_ROLE_ID);
        await r.setMentionable(true)
        await req.app.get('client').channels.cache.find(c => c.id === MOD_LOG_ID).send(`<@${owners[0]}> resubmitted <@${bot.id}>: ${r}`);
        r.setMentionable(false);
        res.json({"redirect": "/success"});
    } catch (e) {
        res.json({"redirect": "/error?e=unknown"});
    }
});

module.exports = route;
