const { Router } = require("express");
const bodyParser = require("body-parser");
const is = require('is-html');
const sanitizeHtml = require('sanitize-html');
const { getUser } = require("@utils/discordApi.js");
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

route.post("/", async (req, res) => {
    let data = req.body;
    
    let user;
    let {refresh_token, access_token} = req.cookies;
    if (!refresh_token) return res.json({ "success": "false", "error": "Invalid token" })

    let result = await getUser({access_token, refresh_token});
    if (!result) return res.redirect("/login");
    [user, {refresh_token, access_token}] = result;
    res.cookie("refresh_token", refresh_token, {httpOnly: true});
    res.cookie("access_token", access_token, {httpOnly: true});
    
    const bot = await Bots.findOne({ botid: data.id }, { _id: false });

    if (!bot)
        return res.json({success: false, message: "Invalid bot id", url: "/error?e=id"})
    if (user.message === "401: Unauthorized")
        return res.json({success: false, message: "Invalid user", url: "/error?e=user"})
    if (!bot.owners.includes(user.id) && !server.admin_user_ids.includes(user.id))
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

    req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${user.id}> has updated <@${bot.botid}>`)
    return res.json({success: true, message: "Added bot", url: `/bots/${bot.botid}`})
});

module.exports = route;
