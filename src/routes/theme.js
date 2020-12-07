const { Router } = require("express");
const path = require('path');


const route = Router();

route.get("/", async (req, res) => {
    res.set('Cache-Control', 'no-store');
    let theme = req.cookies["theme"] || "light";
    
    res.sendFile(path.join(__dirname, `../dynamic/theme/${theme}.css`))
});

module.exports = route;
