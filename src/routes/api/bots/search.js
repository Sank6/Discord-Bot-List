const { Router } = require("express");
const Bots = require("@models/bots");

const route = Router();

route.get("/", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    const bots = await Bots.find({ state: "verified" }, { _id: false })
    res.json(bots.filter(x => Object.values(x).join("").includes(req.query.q.toLowerCase())));
});

module.exports = route;
