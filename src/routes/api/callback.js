const { Router } = require("express");
const passport = require('passport');

const route = Router();

route.get("/", passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/me');
});

module.exports = route;
