const { Router } = require("express");
const getList = require('@utils/getList');

const { bot_options: {bot_tags} } = require("@root/config.json");

const route = Router();

route.get("/:tag", async (req, res) => {
    let { tag } = req.params;
    if(bot_tags.includes(tag)) {
        let bots = await getList()
        bots = bots.filter(bot => {
            let tags = bot.tags
            if (!tags)
                tags = bot_tags.filter(t => t !== tag);
            return tags.includes(tag)
        })
        if (bots == '') 
            bots = null
        
        res.render('tag', {
            cards: bots,
            tag,
            req
        });
    } else {
        res.render('404')
    }
    
});

module.exports = route;
