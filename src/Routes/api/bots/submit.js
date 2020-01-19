const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const { getUser, getBot } = require('@utils/discordapi');
const { BOT_VERIFIERS_ROLE_ID, MOD_LOG_ID, GUILD_ID } = process.env;

const route = Router();
route.use(bodyParser.json({limit: '50mb'}));

route.post("/", async (req, res, next) => {
    let data = req.body;
    if (data.short.length > 120) return res.json({"redirect": "/error?e=long"});

    let [user, tk] = await getUser(req.cookies["refresh_token"]);
    let [bot] = await getBot(data.id);
    res.cookie("refresh_token", tk, {httpOnly: true})
    let memberCheck = req.app.get('client').guilds.get(GUILD_ID).member(user.id);
    
    if (user.message === "401: Unauthorized") return res.json({"redirect": "/error?e=user"})
    if (memberCheck == null) return res.json({"redirect": "/error?e=server"})

    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake.")) return res.json({"redirect": "/error?e=unknown"})
    if (bot.message == "Unknown User") return res.json({"redirect": "/error?e=unknown"})
    if (bot.bot !== true) return res.json({"redirect": "/error?e=human"});

    let owners = [user.id];
    owners = owners.concat(data.owners.replace(',', '').split(' ').remove(''));
    let newBot = {
        name: bot.username,
        id: bot.id,
        logo: `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`,
        invite: data.invite,
        description: data.short,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owners: owners
    };

    if (is(newBot.long) || is(data.short)) return res.json({"redirect": "/error?e=html"});
    let ans = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id == bot.id);

    if (ans !== undefined && ans.state !== "deleted") return res.json({"redirect": `/error?e=${ans.state}`});
    let n = JSON.parse(req.app.get('client').settings.get('bots'));
    if (ans === undefined) n.push(newBot)
    else {
        n.find(u => u.id == bot.id).name = bot.username
        n.find(u => u.id == bot.id).id = bot.id
        n.find(u => u.id == bot.id).logo = `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`
        n.find(u => u.id == bot.id).invite = data.invite
        n.find(u => u.id == bot.id).description = data.short
        n.find(u => u.id == bot.id).long = data.long
        n.find(u => u.id == bot.id).prefix = data.prefix
        n.find(u => u.id == bot.id).state = "unverified"
        n.find(u => u.id == bot.id).owners = owners
    }
    req.app.get('client').settings.update("bots", JSON.stringify(n))

    try {
        let r = req.app.get('client').guilds.get(GUILD_ID).roles.find(r => r.id === BOT_VERIFIERS_ROLE_ID);
        await r.setMentionable(true)
        await req.app.get('client').guilds.get(GUILD_ID).channels.find(c => c.id === MOD_LOG_ID).send(`<@${newBot.owners[0]}> added <@${newBot.id}>: ${r}`);
        r.setMentionable(false);
        res.json({"redirect": "/success"});
    } catch (e) { console.error(e) }
});

module.exports = route;
