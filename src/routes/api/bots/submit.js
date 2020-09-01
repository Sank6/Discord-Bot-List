const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const sanitizeHtml = require('sanitize-html');
const { auth, getBot } = require('@utils/discordApi');
const Bots = require("@models/bots");

const { server } = require("@root/config.json");

const opts = {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img' ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
        a: [ 'href' ],
        img: [ 'src' ]
    },
    allowedSchemes: [ 'https' ]
}

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

route.post("/", auth, async (req, res, next) => {
    let data = req.body;
    if (data.description.length > 120) return res.json({"redirect": "/error?e=long"});
    
    let memberCheck = req.app.get('client').guilds.cache.get(server.id).member(req.user.id);

    let [bot] = await getBot(data.id);
    let f = await Bots.findOne({botid: bot.id});
    if (f) return res.json({"redirect": "/error?e=unknown"})
    if (memberCheck == null) return res.json({"redirect": "/error?e=server"})
    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake.")) return res.json({"redirect": "/error?e=unknown"})
    if (bot.message == "Unknown User") return res.json({"redirect": "/error?e=unknown"})
    if (bot.bot !== true) return res.json({"redirect": "/error?e=human"});
    if (is(data.description)) return res.json({"redirect": "/error?e=html"});

    data.long = sanitizeHtml(data.long, opts)

    if (!data.long.length || !data.description.length || !data.prefix.length)
        return res.json({success: false, message: "Invalid parameter", url: "/error?e=unknown"});

    let owners = [req.user.id];
    owners = owners.concat(data.owners.replace(',', '').split(' ').remove(''));
    
    new Bots({
        username: bot.username,
        botid: bot.id,
        logo: `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`,
        invite: data.invite,
        description: data.description,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owners: owners
    }).save()
    try {
        let r = req.app.get('client').guilds.cache.get(server.id).roles.cache.find(r => r.id === server.role_ids.bot_verifier);
        await r.setMentionable(true)
        await req.app.get('client').channels.cache.find(c => c.id === server.mod_log_id).send(`<@${owners[0]}> submitted <@${bot.id}>: ${r}`);
        r.setMentionable(false);
        res.json({"redirect": "/success"});
    } catch (e) {
        console.log(e)
        res.json({"redirect": "/error?e=unknown"});
    }
});

module.exports = route;
