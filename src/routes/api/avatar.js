const { Router } = require("express");

const route = Router();

route.get("/", async (req, res) => {
    let a = req.query.avatar;
    let got = await fetch(a);
    got = await got.buffer();
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(got, 'binary');
});

module.exports = route;
