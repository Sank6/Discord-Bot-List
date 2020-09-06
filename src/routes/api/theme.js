const { Router } = require("express");

const route = Router();

route.get("/", async (req, res) => {
    let theme = req.cookies["theme"]
    if (theme === "dark") 
        res.cookie("theme", "light")
    else
        res.cookie("theme", "dark");
    res.redirect(req.header('Referer') || '/');
});

module.exports = route;
