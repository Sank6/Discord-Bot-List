const { Router } = require("express");
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

route.post("/", auth, async (req, res) => {
    let data = req.body;
    data.long = sanitizeHtml(data.long, opts)
    
    const bot = await Bots.findOne({ botid: data.id }, { _id: false });

    if (!bot)
        return res.json({success: false, message: "Invalid bot id.", button: {text: "Add bot", url: "/add"}})
    if (!bot.owners.includes(req.user.id) && !server.admin_user_ids.includes(req.user.id))
        return res.json({success: false, message: "Invalid request. Please sign in again.", button: {text: "Logout", url: "/logout"}})
    if (data.description.length >= 120)
        return res.json({success: false, message: "Description too long"})
    if (is(data.description))
        return res.json({success: false, message: "HTML is not supported in your bot summary"});
    if (!data.long.length || !data.description.length || !data.prefix.length)
        return res.json({success: false, message: "Invalid submission. Check you filled all the fields."});

    let { long, description, link, prefix } = data;
    await Bots.updateOne({ botid: data.id }, {$set: { long, description, link, prefix } })

    req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${req.user.id}> has updated <@${bot.botid}>`)
    return res.json({success: true, message: "Added bot", url: `/bots/${bot.botid}`})
});

module.exports = route;
