const { Router } = require("express");
const bodyParser = require("body-parser");

const route = Router();
route.use(bodyParser.json({limit: '50mb'}));

route.post('/:id', (req, res) => {
    let botId = req.params.id;
    let auth = req.headers.authorization;
    if (!auth) return res.json({ "success": "false", "error": "Authorization header not found." });
    let count = req.body.count ? req.body.count : req.body.server_count;

    if (!count) return res.json({ "success": "false", "error": "Count not found in body." });
    count = parseInt(count);
    if (!count) return res.json({ "success": "false", "error": "Count not integer." });
    let bot = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id === botId);
    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });
    if (!bot.auth) return res.json({ "success": "false", "error": "Create a bot authorization token." });
    if (bot.auth !== auth) return res.json({ "success": "false", "error": "Incorrect authorization token." });
    bot.servers = count;

    let updated = JSON.parse(req.app.get('client').settings.get('bots'));
    updated.find(u => u.id === botId).servers = count;
    req.app.get('client').settings.update("bots", JSON.stringify(updated));

    delete bot.auth;
    res.json({ "success": true, "bot": bot });
});

module.exports = route;

