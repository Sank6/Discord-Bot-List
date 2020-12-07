const { Router } = require("express");
const getList = require('@utils/getList');

const { bot_options: {bot_tags} } = require("@root/config.json");

const route = Router();

route.get("/:tag", async (req, res) => {
    if(bot_tags.includes(req.params.tag)) {
        let bots = await getList()
        bots = bots.filter(bot => {
            let tags = bot.tags
            if (!tags)
                tags = bot_tags.filter(e => e !== req.params.tag);
            return tags.includes(req.params.tag)
        })
        if (bots == '') 
            bots = null
        
        res.render('tag', {
            cards: bots,
            req
        });
    } else {
        res.render('404')
    }
    
});

module.exports = route;
