const { Router } = require("express");
const bodyParser = require("body-parser");
const Bots = require("@models/bots");

const authApi = require("@utils/authApi");

const route = Router();
route.use(bodyParser.json({limit: '50mb'}));

route.post('/:id', authApi, async (req, res) => {
    let count = req.body.count || req.body.server_count;

    if (!count) return res.json({ success: "false", error: "Count not found in body." });
    count = parseInt(count);
    if (!count) return res.json({ success: "false", error: "Count not integer." });

    let bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
    if (bot.servers.length > 0 && bot.servers[bot.servers.length-1] &&  Date.now() - bot.servers[bot.servers.length-1].time < ratelimit * 1000) return res.json({ success: "false", error: "You are being ratelimited." });
    
    bot = await Bots.findOneAndUpdate({ botid: req.params.id }, {"$push":{"servers":{"$each": [{count}]}}}, { runValidators: true })
    res.json({ success: true });
});

module.exports = route;
