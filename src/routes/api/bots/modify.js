const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const sanitizeHtml = require('sanitize-html');
const { auth } = require("@utils/discordApi");
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

route.post("/", auth, async (req, res) => {
    let data = req.body;
    
    const bot = await Bots.findOne({ botid: data.id }, { _id: false });

    if (!bot)
        return res.json({success: false, message: "Invalid bot id", url: "/error?e=id"})
    if (!bot.owners.includes(req.user.id) && !server.admin_user_ids.includes(req.user.id))
        return res.json({success: false, message: "Bot owner", url: "/error?e=owner"})
    if (data.description.length >= 120)
        return res.json({success: false, message: "Description too long", url: "/error?e=long"})
    if (is(data.description))
        return res.json({success: false, message: "Description contains HTML", url: "/error?e=html"});

    data.long = sanitizeHtml(data.long, opts)

    if (!data.long.length || !data.description.length || !data.prefix.length)
        return res.json({success: false, message: "Invalid parameter", url: "/error?e=unknown"});

    let { long, description, link, prefix } = data;
    await Bots.updateOne({ botid: data.id }, {$set: { long, description, link, prefix } })

    req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${req.user.id}> has updated <@${bot.botid}>`)
    return res.json({success: true, message: "Added bot", url: `/bots/${bot.botid}`})
});

module.exports = route;
