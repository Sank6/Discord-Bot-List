const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
    let theme = req.cookies["theme"]
    if (!theme) {
        res.cookie("theme", "dark");
        return res.redirect(req.header('Referer') || '/');
    } else if (theme === "light") {
        res.cookie("theme", "dark")
    } else if (theme === "dark") {
        res.cookie("theme", "light")
    }
    res.redirect(req.header('Referer') || '/');
});

module.exports = route;
