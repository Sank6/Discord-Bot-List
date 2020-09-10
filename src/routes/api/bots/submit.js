const { Router } = require("express");
const { auth } = require('@utils/discordApi');
const checkFields = require('@utils/checkFields');
const sanitizeHtml = require('sanitize-html');
const Bots = require("@models/bots");

const { server } = require("@root/config.json");

const opts = {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 's', 'u' ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
        a: [ 'href' ],
        img: [ 'src' ]
    },
    allowedSchemes: [ 'https' ]
}

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

route.post("/:id", auth, async (req, res) => {
    let resubmit = false;
    let check = await checkFields(req);
    if (!check.success) return res.json(check);
    let {bot} = check;
    
    let data = req.body;
    data.long = sanitizeHtml(data.long, opts)

    let owners = [req.user.id];
    owners = owners.concat(data.owners.replace(',', '').split(' ').remove(''));

    let original = await Bots.findOne({botid: req.params.id});
    if (original && original.state !== "deleted")
        return res.json({success: false, message: "Your bot already exists on the list.", button: {text: "Edit", url: `/edit/${bot.id}`}});
    else if (original && original.state == "deleted") resubmit = true;

    if (resubmit) {
        await Bots.updateOne({botid: req.params.id}, {
            username: bot.username,
            invite: data.invite,
            description: data.description,
            long: data.long,
            prefix: data.prefix,
            state: "unverified",
            owners
        });
    } else {
        new Bots({
            username: bot.username,
            botid: req.params.id,
            logo: `https://cdn.discordapp.com/avatars/${req.params.id}/${bot.avatar}.png`,
            invite: data.invite,
            description: data.description,
            long: data.long,
            prefix: data.prefix,
            state: "unverified",
            owners
        }).save();
    }
    try {
        await req.app.get('client').channels.cache.find(c => c.id === server.mod_log_id).send(`<@${owners[0]}> ${resubmit ? "re" : ""}submitted <@${req.params.id}>: <@&${server.role_ids.bot_verifier}>`);
        return res.json({success: true, message: "Your bot has been added"})
    } catch (e) {
        return res.json({success: false, message: "Unknown error"})
    }
});

module.exports = route;
