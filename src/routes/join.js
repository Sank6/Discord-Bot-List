const { Router } = require("express");
const { server: {invite} } = require("@root/config.json");

const route = Router();

route.get("/", async (req, res, next) => {
    res.redirect(invite)
});

module.exports = route;
