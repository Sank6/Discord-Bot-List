const bodyParser = require("body-parser");

const { Router } = require("express");

const bots = require("@routes/api/bots");
const auth = require("@routes/api/auth");
const avatar = require("@routes/api/avatar");
const embed = require("@routes/api/embed");
const theme = require("@routes/api/theme");
const callback = require("@routes/api/callback");

const route = Router();


route.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

route.use("/bots", bots);
route.use("/auth", auth);
route.use("/theme", theme);
route.use("/avatar", avatar);
route.use("/embed", embed);
route.use("/callback", callback);

module.exports = route;
