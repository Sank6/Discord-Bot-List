const { Router } = require("express");
const Bots = require("@models/bots");

const route = Router();

route.get("/:id", async (req, res, next) => {
    let bot = await Bots.findOne({botid: req.params.id}, { _id: false })

    if (!bot) return res.sendStatus(404);
    if (bot.state !== "deleted") return res.sendStatus(404);
    res.render("resubmit", { bot: bot });
});

module.exports = route;
