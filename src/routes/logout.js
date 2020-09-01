const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
  req.logout();
  res.redirect(`/`);
});

module.exports = route;
