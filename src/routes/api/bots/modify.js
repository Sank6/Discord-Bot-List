const { Router } = require("express");
const sanitizeHtml = require('sanitize-html');
const { auth } = require("@utils/discordApi");
const checkFields = require('@utils/checkFields');
const Bots = require("@models/bots");

const { server } = require("@root/config.json");

const opts = {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 's', 'u'],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
        a: [ 'href' ],
        img: [ 'src' ]
    },
    allowedSchemes: [ 'https' ]
}

const route = Router();

route.patch("/:id", auth, async (req, res) => {
    let data = req.body;
    data.long = sanitizeHtml(data.long, opts);
    function isValidUrl(string) {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }

        return true;
    }
    let { long, description, invite, prefix, support, website, github } = data;
    if (data.invite && !isValidUrl(data.invite)) {
        return res.json({ success: false, message: "Enter Valid Invite Link Link with domain protocol. Example https://example.com" })
    }
    if (data.support && !isValidUrl(data.support)) {
        return res.json({ success: false, message: "Enter Valid Support Server Link with domain protocol. Example https://example.com" })
    }
    if (data.website && !isValidUrl(data.website)) {
        return res.json({ success: false, message: "Enter Valid Website Link with domain protocol. Example https://example.com" })
    }
    if (data.github && !isValidUrl(data.github)) {
        return res.json({ success: false, message: "Enter Valid Github Repository Link with domain protocol. Example https://example.com" })
    }
    const bot = await Bots.findOne({ botid: req.params.id }, { _id: false });
    // Old array storage
    if (Array.isArray(bot.owners))
        bot.owners = {
            primary: bot.owners[0],
            additional: bot.owners.slice(1)
        }
        
    let check = await checkFields(req, bot);
    if (!check.success) return res.json(check);

    await Bots.updateOne({ botid: req.params.id }, {$set: { long, description, invite, prefix, support, website, github, owners: {additional: check.users} } })

    req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${req.user.id}> has updated <@${bot.botid}>`)
    return res.json({success: true, message: "Added bot", url: `/bots/${bot.botid}`})
});

module.exports = route;
