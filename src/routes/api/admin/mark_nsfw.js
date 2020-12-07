const { Router } = require("express");

const route = Router();

route.get("/", async (req, res) => {
    res.sendStatus(200)
});

module.exports = route;
