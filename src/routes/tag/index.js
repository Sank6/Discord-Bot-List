const { Router } = require("express");
const { auth } = require('@utils/discordApi');
const Bots = require("@models/bots");


const { web: {recaptcha_v2: {site_key}}, bot_options: {bot_tags, max_bot_tags} } = require("@root/config.json");

const route = Router();

route.get("/:tag", async (req, res) => {
    let theme = "light";
    if (req.cookies["theme"] === "dark") theme = "dark"
    if(bot_tags.includes(req.params.tag)) {
        let bots = await Bots.find({"state": "verified"}, { _id: false, auth: false, __v: false, addedAt: false })
        bots = bots.filter(bot => {
            let tags = bot.tags
            if (!tags)
                tags = bot_tags.filter(e => e !== req.params.tag);
            return tags.includes(req.params.tag)
        })
        bots.sort((a, b) => b.likes - a.likes);
        if (bots == '') 
            bots = null
        let data = {
            user: req.user,
            cards: bots,
            tag: req.params.tag
        };
        res.render('tag', data)
    } else {
        res.render('404', {user: req.user, tags: bot_tags, count: max_bot_tags, theme, site_key})
    }
    
});

module.exports = route;
