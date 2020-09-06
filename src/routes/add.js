const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
    res.render("add", {user: req.user})
});

module.exports = route;