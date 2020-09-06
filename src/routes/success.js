const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
    res.render("success", {user: req.user})
});

module.exports = route;