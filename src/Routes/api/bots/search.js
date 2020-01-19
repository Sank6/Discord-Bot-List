const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    let q = req.query.q.toLowerCase()
    let ans = JSON.parse(req.app.get('client').settings.get('bots')).filter(u => u.long.toLowerCase().includes(q) || u.description.toLowerCase().includes(q));
    res.json(ans);
});

module.exports = route;
