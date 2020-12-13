const { Router } = require("express");
const bodyParser = require("body-parser");
const Bots = require("@models/bots");
const Users = require("@models/users");

const route = Router();
route.use(bodyParser.json({ limit: '50mb' }));

route.post('/:id', async (req, res) => {
    let botid = req.params.id;
    let auth = req.headers.authorization;
    if (!auth) return res.json({ success: "false", error: "Authorization header not found." });
    let count = req.body.userid;
    if (!count) return res.json({ success: "false", error: "User ID not found in body." });
    count = parseInt(count);
    if (!count) return res.json({ success: "false", error: "Not Valid User ID." });
    let bot = await Bots.findOne({ botid }, { _id: false })
    if (!bot) return res.json({ success: "false", error: "Bot not found." });
    if (!bot.auth) return res.json({ success: "false", error: "Create a bot authorization token." });
    if (bot.auth !== auth) return res.json({ success: "false", error: "Incorrect authorization token." });
    let user = await Users.findOne({ userid: req.body.userid })
    if (user && user.liked == req.params.id && (Date.now() - user.date.getTime()) < 43200000) {
        return res.json({ success: true, liked: "true" })
    } else {
        return res.json({ success: false, liked: "false" })
    }
});

module.exports = route;
