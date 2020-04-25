const { Router } = require("express");

const bots = require("@routes/bots/index");
const api = require("@routes/api/index");
const theme = require("@routes/theme");

const join = require("@routes/join");
const login = require("@routes/login");
const logout = require("@routes/logout");
const user = require("@routes/user");
const me = require("@routes/me");

const route = Router();

route.use("/bots", bots);
route.use("/api", api);
route.use("/theme", theme);

route.use("/join", join);
route.use("/logout", logout);
route.use("/login", login);
route.use("/user", user);
route.use("/me", me);


route.get('/', (req, res) => {
    if (!req.query.q) res.render('index');
    else res.redirect(`/bots/search?q=${encodeURIComponent(req.query.q)}`)
});

module.exports = route;
