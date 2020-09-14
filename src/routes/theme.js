const { Router } = require("express");
const path = require('path');


const route = Router();

route.get("/", async (req, res) => {
    res.set('Cache-Control', 'no-store');
    let theme = req.cookies["theme"]
    if (!theme) return res.sendFile(path.join(__dirname, "../dynamic/theme/light.css"))
    else if (theme === "dark") return res.sendFile(path.join(__dirname, "../dynamic/theme/dark.css"));
    else return res.sendFile(path.join(__dirname, "..//dynamic/theme/light.css"))
});

module.exports = route;
