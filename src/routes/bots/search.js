const { Router } = require("express");
const Bots = require("@models/bots");
const getList = require('@utils/getList.js')

const route = Router();

route.get("/", async (req, res, next) => {
    let search = req.query.q;
    if (!search) search = "";
    search = search.toLowerCase();
    let bots = await getList();
    let found = bots.filter(bot => {
        if (bot.username.toLowerCase().includes(search)) return true;
        else if (bot.description.toLowerCase().includes(search)) return true;
        else return false;
    });
    if (!found) return res.send({ error: "No bots found for this search" });
    let data = {
        cards: found,
        search: search
    };
    res.render("search", data);
});

module.exports = route;
