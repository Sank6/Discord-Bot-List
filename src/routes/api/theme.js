const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
    let theme = req.cookies["theme"]
    if (!theme) {
        res.cookie("theme", "light");
        return res.redirect(req.header('Referer') || '/');
    } else if (theme === "light") {
        res.cookie("theme", "dark")
    } else if (theme === "light") {
        res.cookie("theme", "dark")
    }
    res.redirect(req.header('Referer') || '/');
});

module.exports = route;
