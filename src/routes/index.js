const { Router } = require("express");

const bots = require("@routes/bots/index");
const tag = require("@routes/tag/index");
const api = require("@routes/api/index");
const theme = require("@routes/theme");

const route = Router();

route.use("/bots", bots);
route.use("/tag", tag);
route.use("/api", api);
route.use("/theme", theme);

route.get('/', (req, res) => {
    if (!req.query.q) res.render('index', {req});
    else res.redirect(`/bots/search?q=${encodeURIComponent(req.query.q)}`)
});

module.exports = route;
