const { Router } = require("express");

const bots = require("@routes/bots/index");
const api = require("@routes/api/index");
const theme = require("@routes/theme");

const route = Router();

route.use("/bots", bots);
route.use("/api", api);
route.use("/theme", theme);

route.get('/', (req, res) => {
    if (!req.query.q) res.render('index', {user: req.user});
    else res.redirect(`/bots/search?q=${encodeURIComponent(req.query.q)}`)
});

route.use((req, res) => {
    res.status(404);

    if (req.accepts('html'))
        return res.render('404');
    
    if (req.accepts('json'))
      return res.send({
        status: 404,
        error: 'Not found'
      });
  
    res.type('txt').send('404 - Not found');
});

module.exports = route;
