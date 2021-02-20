const { Router } = require("express");
const bodyParser = require("body-parser");
const { auth } = require("@utils/discordApi");
const Bots = require("@models/bots");

const { server } = require("@root/config.json");

const route = Router();
route.use(bodyParser.urlencoded({extended: true}));

route.delete("/:id", auth, async (req, res) => {
    let {id} = req.params;
    
    const bot = await Bots.findOne({ botid: id }, { _id: false })

    if (!bot) return res.sendStatus(404)
    if (bot.owners.primary !== req.user.id && !server.admin_user_ids.includes(req.user.id)) return res.sendStatus(403)
    
    await Bots.deleteOne({ botid: id })

    req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${req.user.id}> has deleted <@${bot.botid}>`);
    req.app.get('client').guilds.cache.get(server.id).members.fetch(id).then(bot => {bot.kick()}).catch(() => {})
    res.sendStatus(200)
});

module.exports = route;
