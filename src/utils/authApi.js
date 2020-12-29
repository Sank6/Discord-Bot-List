const Bots = require("@models/bots");

const { web: { ratelimit } } = require("@root/config.json");

module.exports = async(req, res, next) => {
    let auth = req.headers.authorization;
    if (!auth) return res.json({ success: "false", error: "Authorization header not found." });

    const bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });

    if (!bot.auth) return res.json({ success: "false", error: "Create a bot authorization token." });
    if (bot.auth !== auth) return res.json({ success: "false", error: "Incorrect authorization token." });

    if (bot.ratelimit && Date.now() - bot.ratelimit < (ratelimit * 1000)) return res.json({ success: "false", error: "You are being ratelimited." });

    Bots.updateOne({ botid: req.params.id }, { ratelimit: Date.now() })
    return next();
}
