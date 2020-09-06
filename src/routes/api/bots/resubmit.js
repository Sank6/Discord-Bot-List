const { Router } = require("express");
const is = require('is-html');
const { auth, getBot } = require('@utils/discordApi');
const Bots = require("@models/bots");

const { server } = require("@root/config.json");

const route = Router();

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

route.post("/", auth, async (req, res) => {
    let data = req.body;
    if (data.description.length > 120) return res.json({success: false, message: "Your description is too long."});
    
    let memberCheck = req.app.get('client').guilds.cache.get(server.id).member(req.user.id);

    let [bot] = await getBot(data.id);
    if (memberCheck == null)
        return res.json({success: false, message: "You aren't in the server", button: {text: "Join", url: "/join"}})
    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake."))
        return res.json({success: false, message: "Invalid bot id"})
    if (bot.message == "Unknown User" || bot.bot !== true)
        return res.json({success: false, message: "Invalid bot id"})
    if (data.description.length >= 120)
        return res.json({success: false, message: "Description too long"})
    if (is(data.description))
        return res.json({success: false, message: "HTML is not supported in your bot summary"});
    if (!data.long.length || !data.description.length || !data.prefix.length)
        return res.json({success: false, message: "Invalid submission. Check you filled all the fields."});

    let owners = [req.user.id];
    owners = owners.concat(data.owners.replace(',', '').split(' ').remove(''));

    let original = await Bots.findOne({botid: bot.id});
    if (original && original.state !== "deleted")
        return res.json({success: false, message: "Your bot already exists on the list.", button: {text: "Edit", url: `/edit/${bot.id}`}});
    if (!original)
        return res.json({success: false, message: "Your bot doesn't exist.", button: {text: "New Bot", url: "/new"}});

    await Bots.updateOne({botid: bot.id}, {
        username: bot.username,
        invite: data.invite,
        description: data.description,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owners
    });
    try {
        await req.app.get('client').channels.cache.find(c => c.id === server.mod_log_id).send(`<@${owners[0]}> resubmitted <@${bot.id}>: <@&${server.role_ids.bot_verifier}>`);
        return res.json({success: true, message: "Your bot has been added"})
    } catch (e) {
        return res.json({success: false, message: "Unknown error"})
    }
});

module.exports = route;
