const { Router } = require("express");
const bodyParser = require("body-parser");
const Bots = require("@models/bots");
const Users = require("@models/users");

const { web: { ratelimit } } = require("@root/config.json");

const route = Router();
route.use(bodyParser.json({ limit: '50mb' }));

route.get('/:id', async (req, res) => {
    let botid = req.params.id;
    let auth = req.headers.authorization;
    if (!auth) return res.json({ success: "false", error: "Authorization header not found." });
    let bot = await Bots.findOne({ botid }, { _id: false })
    if (!bot) return res.json({ success: "false", error: "Bot not found." });
    if (!bot.auth) return res.json({ success: "false", error: "Create a bot authorization token." });
    if (bot.auth !== auth) return res.json({ success: "false", error: "Incorrect authorization token." });
    let user = await Users.find({}, { _id: false })
    let likers = [];
    for (i = 0; i < Object.keys(user).length; i++) {
        if (Object(user)[i].voted == botid && (Date.now() - Object(user)[i].date.getTime()) < 43200000) {
            likers = likers.concat(Object(user)[i].userid)
        }
    }
    return res.json({ success: "true", likers: likers })
});

module.exports = route;

