const { Router } = require("express");

const route = Router();

route.get("/", async (req, res) => {
    res.render("success", {req})
});

module.exports = route;