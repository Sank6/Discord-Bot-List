const { Router } = require("express");
const getList = require('@utils/getList.js')

const route = Router();

route.get("/", async (req, res, next) => {
    let search = req.query.q;
    if (!search) search = "";
    search = search.toLowerCase();
    let bots = getList(req.app.get('client'));
    let found = bots.filter(bot => {
        if (bot.name.toLowerCase().includes(search)) return true;
        else if (bot.description.toLowerCase().includes(search)) return true;
        else return false;
    });
    if (!found) return res.send({ error: "No bots found for this search" });
    let data = {
        cards: found,
        search: search
    };
    res.render("search/index", data);
});

module.exports = route;
